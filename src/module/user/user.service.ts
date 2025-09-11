/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../error/AppError";
import { TCustomer } from "../customer/customer.interface";
import { TQuery, TStatus, TUSer, TUSerRole } from "./user.interface";
import { User } from "./user.model";
import { calculateAge, capitalizeFirstWord } from "./user.utills";
import mongoose from "mongoose";
import { Customer } from "../customer/customer.model";
import {
  createToken,
  generateOTP,
  passwordMatching,
} from "../auth/auth.utills";
import config from "../../config";
import { USER_ROLE } from "./user.const";
import { TMealProvider } from "../mealProvider/mealProvider.interface";
import { MealProvider } from "../mealProvider/mealProvider.model";
import bcrypt from "bcrypt";
import { TJwtPayload } from "../auth/auth.interface";
import { JwtPayload } from "jsonwebtoken";
import { otpEmailTemplate } from "../../utills/otpEmailTemplate";
import { sendEmail } from "../../utills/sendEmail";
import { Kitchen } from "../kitchen/kitchen.model";

const createCustomer = async (userData: TUSer, customer: TCustomer) => {
  const isEmailExists = await User.findOne({
    email: userData?.email,
    isDeleted: false,
  });
  if (isEmailExists) {
    throw new AppError(StatusCodes.CONFLICT, "this email is already in used");
  }
  const isPhoneExists = await User.findOne({
    phoneNumber: userData?.phone,
    isDeleted: false,
  });
  if (isPhoneExists) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "this phone number is already in used"
    );
  }
  const age = calculateAge(customer.dateOfBirth);
  if (age < 18) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "You must be at least 18 years old."
    );
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    userData.role = USER_ROLE.customer;
    const userInfo = await User.create([userData], { session });
    if (!userInfo.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, "user regestration faild");
    }
    const user = userInfo[0];
    customer.user = user?._id;
    customer.name = capitalizeFirstWord(customer?.name);
    const customerInfo = await Customer.create([customer], { session });
    if (!customerInfo.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, "user regestration faild");
    }
    const jwtPayload = {
      userId: user?._id.toString(),
      userRole: user?.role,
    };
    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string
    );
    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      config.jwt_refresh_expires_in as string
    );

    const newotp = generateOTP().toString();
    const hashedOTP = await bcrypt.hash(
      newotp,
      Number(config.bcrypt_salt_round as string)
    );
    const jwtPayload1: TJwtPayload = {
      userId: `${user?._id.toString() as string} ${hashedOTP}`,
      userRole: user?.role as TUSerRole,
    };
    const refresh1Token = createToken(
      jwtPayload1,
      config.jwt_refresh1_secret as string,
      config.jwt_refresh1_expires_in as string
    );
    if (!refresh1Token || !hashedOTP) {
      throw new AppError(StatusCodes.BAD_REQUEST, "user regestration faild");
    }
    const html = otpEmailTemplate(newotp);
    await sendEmail({
      to: user?.email,
      html,
      subject: "Your one time password(OTP)",
      text: "This one time password is valid for only 2 minutes",
    });
    await session.commitTransaction();
    await session.endSession();
    const customerData = customerInfo[0];
    return { accessToken, refreshToken, refresh1Token, customerData };
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

const createMealProvider = async (
  userData: TUSer,
  mealProvider: TMealProvider
) => {
  const isEmailExists = await User.findOne({
    email: userData?.email,
    isDeleted: false,
  });
  if (isEmailExists) {
    throw new AppError(StatusCodes.CONFLICT, "this email is already in used");
  }
  const isPhoneExists = await User.findOne({
    phoneNumber: userData?.phone,
    isDeleted: false,
  });
  if (isPhoneExists) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "this phone number is already in used"
    );
  }
  const age = calculateAge(mealProvider?.dateOfBirth);
  if (age < 18) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "You must be at least 18 years old."
    );
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    userData.role = USER_ROLE.mealProvider;
    const userInfo = await User.create([userData], { session });
    if (!userInfo.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, "user regestration faild");
    }
    const user = userInfo[0];
    mealProvider.user = user?._id;
    mealProvider.name = capitalizeFirstWord(mealProvider?.name);
    const mealProviderInfo = await MealProvider.create([mealProvider], {
      session,
    });
    if (!mealProviderInfo.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, "user regestration faild");
    }
    const jwtPayload = {
      userId: user?._id.toString(),
      userRole: user?.role,
    };
    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string
    );
    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      config.jwt_refresh_expires_in as string
    );
    const newotp = generateOTP().toString();
    const hashedOTP = await bcrypt.hash(
      newotp,
      Number(config.bcrypt_salt_round as string)
    );
    const jwtPayload1: TJwtPayload = {
      userId: `${user?._id.toString() as string} ${hashedOTP}`,
      userRole: user?.role as TUSerRole,
    };
    const refresh1Token = createToken(
      jwtPayload1,
      config.jwt_refresh1_secret as string,
      config.jwt_refresh1_expires_in as string
    );
    if (!refresh1Token || !hashedOTP) {
      throw new AppError(StatusCodes.BAD_REQUEST, "user regestration faild");
    }
    const html = otpEmailTemplate(newotp);
    await sendEmail({
      to: user?.email,
      html,
      subject: "Your one time password(OTP)",
      text: "This one time password is valid for only 2 minutes",
    });
    await session.commitTransaction();
    await session.endSession();
    const customerData = mealProviderInfo[0];
    return { accessToken, refreshToken, refresh1Token, customerData };
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

const getMeroute = async (userId: string, userRole: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "data not available");
  }
  let userdata = null;
  if (userRole === USER_ROLE.customer || userRole === USER_ROLE.admin) {
    userdata = await Customer.findOne({ user: userId });
  }
  if (userRole === USER_ROLE.mealProvider) {
    userdata = await MealProvider.findOne({ user: userId });
  }
  if (!userdata) {
    throw new AppError(StatusCodes.NOT_FOUND, "data not available");
  }
  const result = { user, userdata };
  return result;
};

const getAllUsersWithProfile = async (query: TQuery) => {
  const {
    searchTerm = "",
    sortBy = "createdAt",
    sortOrder = "desc",
    role,
    status,
    verifiedWithEmail,
    gender,
    hasKitchen,
    page = 1,
    limit = 10,
  } = query;

  const matchConditions: Record<string, any> = {
    isDeleted: false,
  };

  if (role) matchConditions.role = role;
  if (status) matchConditions.status = status;
  if (verifiedWithEmail !== undefined) {
    matchConditions.verifiedWithEmail = verifiedWithEmail === "true";
  }

  const searchConditions =
    searchTerm.trim() !== ""
      ? {
          $or: [
            { email: { $regex: searchTerm, $options: "i" } },
            { phone: { $regex: searchTerm, $options: "i" } },
            { "profile.name": { $regex: searchTerm, $options: "i" } },
          ],
        }
      : {};
  const sortFieldMap: Record<string, string> = {
    name: "profile.name",
    status: "status",
    verifiedWithEmail: "verifiedWithEmail",
    createdAt: "createdAt",
  };

  const sortCondition: Record<string, number> = {
    [sortFieldMap[sortBy] || sortBy]: sortOrder === "asc" ? 1 : -1,
  };
  const parsedPage = Number(page);
  const parsedLimit = Number(limit);
  const skip = (parsedPage - 1) * parsedLimit;

  try {
    const result = await User.aggregate([
      { $match: { role: { $ne: "superAdmin" }, ...matchConditions } },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "user",
          as: "customerInfo",
        },
      },
      {
        $lookup: {
          from: "mealproviders",
          localField: "_id",
          foreignField: "user",
          as: "mealProviderInfo",
        },
      },
      {
        $addFields: {
          profile: {
            $switch: {
              branches: [
                {
                  case: { $in: ["$role", ["customer", "admin"]] },
                  then: { $arrayElemAt: ["$customerInfo", 0] },
                },
                {
                  case: { $eq: ["$role", "mealProvider"] },
                  then: { $arrayElemAt: ["$mealProviderInfo", 0] },
                },
              ],
              default: null,
            },
          },
        },
      },
      {
        $match: {
          ...(gender && { "profile.gender": gender }),
          ...(hasKitchen !== undefined
            ? { "profile.hasKitchen": hasKitchen === "true" }
            : {}),
          ...searchConditions,
        },
      },
      {
        $project: {
          password: 0,
          passwordChangedAt: 0,
          isDeleted: 0,
          customerInfo: 0,
          mealProviderInfo: 0,
        },
      },
      {
        $sort: sortCondition as { [key: string]: 1 | -1 },
      },
      { $skip: skip },
      { $limit: parsedLimit },
    ]);
    if (!result) {
      throw new AppError(StatusCodes.NOT_FOUND, "No user data found");
    }
    const total = await User.countDocuments({
      ...matchConditions,
      ...searchConditions,
    });
    const totalPage = Math.ceil(total / parsedLimit);
    const meta = {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPage,
    };
    return {
      meta,
      result,
    };
  } catch (err: any) {
    throw new AppError(StatusCodes.NOT_FOUND, err);
  }
};

const getUserProfile = async (id: string) => {
  let userId: string | null = null;
  let role: TUSerRole | null = null;
  let result;
  const isUser = await User.findById(id).select("role isDeleted");

  if (isUser) {
    if (isUser.isDeleted) {
      throw new AppError(StatusCodes.NOT_FOUND, "user data is not available");
    }
    userId = isUser._id.toString();
    role = isUser?.role;
  } else {
    const mealProviderExists = await MealProvider.findById(id, {
      isDeleted: 0,
      createdAt: 0,
      updatedAt: 0,
    }).populate({ path: "user", select: "-isDeleted -updatedAt" });
    if (mealProviderExists) {
      result = mealProviderExists;
    } else {
      const customerExists = await Customer.findById(id, {
        isDeleted: 0,
        createdAt: 0,
        updatedAt: 0,
      }).populate({ path: "user", select: "-isDeleted -updatedAt" });
      if (customerExists) {
        result = customerExists;
      }
    }
  }

  if (role === "mealProvider") {
    result = await MealProvider.findOne(
      { user: userId },
      { isDeleted: 0, createdAt: 0, updatedAt: 0 }
    ).populate({ path: "user", select: "-isDeleted -updatedAt" });
  }
  if (role === "admin" || role === "customer") {
    result = await Customer.findOne(
      { user: userId },
      { isDeleted: 0, createdAt: 0, updatedAt: 0 }
    ).populate({ path: "user", select: "-isDeleted -updatedAt" });
  }
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "user data is not available");
  }
  return result;
};

const changeUserStatus = async ({
  status,
  userId,
  role,
}: {
  status: TStatus;
  userId: string;
  role: string;
}) => {
  const isUSer = await User.findById(userId).select("role status");
  if (!isUSer) {
    throw new AppError(StatusCodes.CONFLICT, "user info not found");
  }
  if (isUSer?.status === status) {
    throw new AppError(
      StatusCodes.CONFLICT,
      `this user status is already ${isUSer?.status}`
    );
  }
  if (isUSer?.role === USER_ROLE.admin && role === USER_ROLE.admin) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "you can`t change an admin status"
    );
  }
  const result = await User.findByIdAndUpdate(
    userId,
    { status: status },
    { new: true, runValidators: true }
  );
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to change status");
  }
  return result;
};

const dleteMyAccount = async (id: string, payload: { password: string }) => {
  const isUserExist = await User.findById(id).select("password");
  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "user data not found");
  }
  const userPass = isUserExist?.password;
  const isPasswordMatched = await passwordMatching(payload?.password, userPass);
  if (!isPasswordMatched) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "the password you have provided is wrong"
    );
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const deleteFromUser = await User.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { session, new: true, runValidators: true }
    );
    if (!deleteFromUser) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "faild to delete your account"
      );
    }
    const role = deleteFromUser?.role;
    let deleteAccount;
    if (role === USER_ROLE.mealProvider) {
      deleteAccount = await MealProvider.findOneAndUpdate(
        { user: id },
        { isDeleted: true },
        { session, new: true, runValidators: true }
      );
    }
    if (role === USER_ROLE.mealProvider && deleteAccount) {
      const result = await Kitchen.findOneAndUpdate(
        { owner: deleteAccount?._id },
        { isDeleted: true },
        { session, new: true, runValidators: true }
      );
      if (!result) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          "faild to delete your account"
        );
      }
    }
    if (role === USER_ROLE.customer) {
      deleteAccount = await Customer.findOneAndUpdate(
        { user: id },
        { isDeleted: true },
        { session, new: true, runValidators: true }
      );
    }
    if (!deleteAccount) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "faild to delete your account"
      );
    }
    await session.commitTransaction();
    await session.endSession();
    return deleteFromUser;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

const deleteAccount = async (id: string, role: string) => {
  const isUserExists = await User.findById(id).select("role isDeleted");
  if (!isUserExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "user data is not available");
  }
  if (isUserExists?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "user data is not available");
  }
  if (
    role === USER_ROLE.admin &&
    (isUserExists?.role === USER_ROLE.admin ||
      isUserExists?.role === USER_ROLE.superAdmin)
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "you can`t delete an admin account"
    );
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const deleteFromUser = await User.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { session, new: true, runValidators: true }
    );
    if (!deleteFromUser) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "faild to delete your account"
      );
    }
    const role = deleteFromUser?.role;
    let deleteAccount;
    if (role === USER_ROLE.mealProvider) {
      deleteAccount = await MealProvider.findOneAndUpdate(
        { user: id },
        { isDeleted: true },
        { session, new: true, runValidators: true }
      );
    }
    if (role === USER_ROLE.mealProvider && deleteAccount) {
      const result = await Kitchen.findOneAndUpdate(
        { owner: deleteAccount?._id },
        { isDeleted: true },
        { session, new: true, runValidators: true }
      );
      if (!result) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          "faild to delete your account"
        );
      }
    }
    if (role === USER_ROLE.customer) {
      deleteAccount = await Customer.findOneAndUpdate(
        { user: id },
        { isDeleted: true },
        { session, new: true, runValidators: true }
      );
    }
    if (!deleteAccount) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "faild to delete your account"
      );
    }
    await session.commitTransaction();
    await session.endSession();
    return deleteFromUser;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

const updatePhoneEmail = async (id: string, payload: Partial<TUSer>) => {
  const { email, phone, password } = payload;
  if (email && !password) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You need the password to update the email"
    );
  }
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    let updatedNumber = null;
    if (phone) {
      const isPhoneExists = await User.findOne({ phone: phone }).select(
        "phone"
      );
      if (isPhoneExists) {
        throw new AppError(
          StatusCodes.CONFLICT,
          "this phone number is already exists"
        );
      }
      updatedNumber = await User.findByIdAndUpdate(
        id,
        { phone: phone },
        { session, new: true, runValidators: true }
      );
      if (!updatedNumber) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          "faild to update phone number"
        );
      }
    }

    let updatedEmail = null;
    let otpToken = null;
    if (email) {
      const isUserExist = await User.findById(id).select("password");
      if (!isUserExist) {
        throw new AppError(StatusCodes.NOT_FOUND, "user data not found");
      }
      const userPass = isUserExist?.password;
      const isPasswordMatched = await passwordMatching(password!, userPass);
      if (!isPasswordMatched) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          "the password you have provided is wrong"
        );
      }
      const isEmailExist = await User.findOne({ email: email }).select("email");
      if (isEmailExist) {
        throw new AppError(
          StatusCodes.CONFLICT,
          "this email is already exists"
        );
      }
      updatedEmail = await User.findByIdAndUpdate(
        id,
        { email: email, verifiedWithEmail: false },
        { session, new: true, runValidators: true }
      );

      if (!updatedEmail) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          "faild to update Email address"
        );
      }
      const isUSer = await User.findById(id);
      const newotp = generateOTP().toString();
      const hashedOTP = await bcrypt.hash(
        newotp,
        Number(config.bcrypt_salt_round as string)
      );
      const jwtPayload: TJwtPayload = {
        userId: `${isUSer?._id.toString() as string} ${hashedOTP}`,
        userRole: isUSer?.role as TUSerRole,
      };
      otpToken = createToken(
        jwtPayload,
        config.jwt_refresh1_secret as string,
        config.jwt_refresh1_expires_in as string
      );

      if (otpToken && hashedOTP) {
        const html = otpEmailTemplate(newotp);
        await sendEmail({
          to: email,
          html,
          subject: "Your one time password(OTP)",
          text: "This one time password is valid for only 2 minutes",
        });
      }
    }
    await session.commitTransaction();
    await session.endSession();
    return { updatedNumber, otpToken };
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

const verifyEmail = async (payload: { otp: string }, user: JwtPayload) => {
  const { otp } = payload;
  const { userId } = user;
  const hashedOtp = userId.split(" ")[1];
  const id = userId.split(" ")[0];
  const isOtpMatched = await passwordMatching(otp, hashedOtp);
  if (!isOtpMatched) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "the otp you have provided is wrong"
    );
  }
  const verifyEmail = await User.findByIdAndUpdate(
    id,
    { verifiedWithEmail: true },
    { new: true }
  );
  if (!verifyEmail) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to update email");
  }
  return verifyEmail;
};

export const userService = {
  createCustomer,
  createMealProvider,
  getMeroute,
  changeUserStatus,
  dleteMyAccount,
  deleteAccount,
  updatePhoneEmail,
  verifyEmail,
  getAllUsersWithProfile,
  getUserProfile,
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../error/AppError";
import { TCustomer } from "../customer/customer.interface";
import { TStatus, TUSer, TUSerRole } from "./user.interface";
import { User } from "./user.model";
import { calculateAge, capitalizeFirstWord } from "./user.utills";
import mongoose from "mongoose";
import { Customer } from "../customer/customer.model";
import {
  createToken,
  generateOTP,
  passwordMatching,
  verifyToken,
  verifyUser,
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
    customer.user = user?._id;
    customer.email = user?.email;
    customer.name = capitalizeFirstWord(customer?.name);
    const customerInfo = await Customer.create([customer], { session });
    if (!customerInfo.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, "user regestration faild");
    }
    await session.commitTransaction();
    await session.endSession();
    const customerData = customerInfo[0];
    return { accessToken, refreshToken, customerData };
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
  if (mealProvider?.isCertified && !mealProvider?.licenseDocument) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "if you are certified then provied your license number"
    );
  }
  if (mealProvider?.licenseDocument) {
    const isLicenseExists = await MealProvider.findOne({
      licenseDocument: mealProvider?.licenseDocument,
    });
    if (isLicenseExists) {
      throw new AppError(
        StatusCodes.CONFLICT,
        "this license number is already in used"
      );
    }
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
    userData.role = USER_ROLE["meal provider"];
    const userInfo = await User.create([userData], { session });
    if (!userInfo.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, "user regestration faild");
    }
    const user = userInfo[0];
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
    mealProvider.user = user?._id;
    mealProvider.email = user?.email;
    mealProvider.name = capitalizeFirstWord(mealProvider?.name);
    const mealProviderInfo = await MealProvider.create([mealProvider], {
      session,
    });
    if (!mealProviderInfo.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, "user regestration faild");
    }
    await session.commitTransaction();
    await session.endSession();
    const customerData = mealProviderInfo[0];
    return { accessToken, refreshToken, customerData };
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

const getMeroute = async (userId: string, userRole: string) => {
  let result = null;
  if (userRole === USER_ROLE.customer || userRole === USER_ROLE.admin) {
    result = await Customer.findOne({ user: userId }).populate("user");
  }
  if (userRole === USER_ROLE["meal provider"]) {
    result = await MealProvider.findOne({ user: userId }).populate("user");
  }
  if (userRole === USER_ROLE.superAdmin) {
    result = await User.findById(userId);
  }
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "data not available");
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
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await User.findByIdAndUpdate(
      userId,
      { status: status },
      { new: true, session, runValidators: true }
    );
    if (!result) {
      throw new AppError(StatusCodes.BAD_REQUEST, "faild to change status");
    }
    await session.commitTransaction();
    await session.endSession();
    return result;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

const dleteMyAccount = async (id: string) => {
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
    const email = deleteFromUser?.email;
    let deleteAccount;
    if (role === USER_ROLE["meal provider"]) {
      deleteAccount = await MealProvider.findOneAndUpdate(
        { email: email },
        { isDeleted: true },
        { session, new: true, runValidators: true }
      );
    }

    if (role === USER_ROLE["meal provider"] && deleteAccount) {
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
        { email: email },
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
  const isUserExist = await verifyUser(id);
  if (
    role === USER_ROLE.admin &&
    (isUserExist?.role === USER_ROLE.admin ||
      isUserExist?.role === USER_ROLE.superAdmin)
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
    const email = deleteFromUser?.email;

    let deleteAccount;
    if (role === USER_ROLE["meal provider"]) {
      deleteAccount = await MealProvider.findOneAndUpdate(
        { email: email },
        { isDeleted: true },
        { session, new: true, runValidators: true }
      );
    }

    if (role === USER_ROLE["meal provider"] && deleteAccount) {
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
        { email: email },
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
  const { email, phone } = payload;
  let updatedNumber = null;
  if (phone) {
    const isPhoneExists = await User.findOne({ phone: phone }).select("phone");
    if (isPhoneExists) {
      throw new AppError(
        StatusCodes.CONFLICT,
        "this phone number is already exists"
      );
    }
    updatedNumber = await User.findByIdAndUpdate(
      id,
      { phone: phone },
      { new: true }
    );
    if (!updatedNumber) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "faild to update phone number"
      );
    }
  }
  let otpToken = null;
  if (email) {
    const isEmailExist = await User.findOne({ email: email }).select("email");
    if (isEmailExist) {
      throw new AppError(StatusCodes.CONFLICT, "this email is already exists");
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
      email: email,
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
  return { updatedNumber, otpToken };
};

const verifyEmail = async (payload: { otp: string }, otpToken: string) => {
  const { otp } = payload;
  const secret = config.jwt_refresh1_secret as string;
  const decoded = verifyToken(otpToken, secret);
  const { userId, email, userRole } = decoded as JwtPayload;
  const hashedOtp = userId.split(" ")[1];
  const id = userId.split(" ")[0];
  const isOtpMatched = await passwordMatching(otp, hashedOtp);
  if (!isOtpMatched) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "the otp you have provided is wrong"
    );
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const updateEmailFromUser = await User.findByIdAndUpdate(
      id,
      { email: email },
      { session, new: true, runValidators: true }
    );

    if (!updateEmailFromUser) {
      throw new AppError(StatusCodes.BAD_REQUEST, "faild to update email");
    }

    if (userRole === USER_ROLE["meal provider"]) {
      const updateMealProviderEmail = await MealProvider.findOneAndUpdate(
        { user: id },
        { email: email },
        { session, new: true, runValidators: true }
      );
      if (!updateMealProviderEmail) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update email");
      }
    }
    if (userRole === USER_ROLE.customer || userRole === USER_ROLE.admin) {
      const updateCustomerEmail = await Customer.findOneAndUpdate(
        { user: id },
        { email: email },
        { session, new: true, runValidators: true }
      );
      if (!updateCustomerEmail) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update email");
      }
    }
    await session.commitTransaction();
    await session.endSession();
    return updateEmailFromUser;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
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
};

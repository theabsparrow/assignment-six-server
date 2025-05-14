import { StatusCodes } from "http-status-codes";
import AppError from "../../error/AppError";
import { TChangePassword, TJwtPayload, TLogin } from "./auth.interface";
import { User } from "../user/user.model";
import {
  createToken,
  generateOTP,
  passwordMatching,
  verifyUser,
  verifyUserByEmail,
} from "./auth.utills";
import config from "../../config";
import bcrypt from "bcrypt";
import { TUSerRole } from "../user/user.interface";
import { JwtPayload } from "jsonwebtoken";
import { otpEmailTemplate } from "../../utills/otpEmailTemplate";
import { sendEmail } from "../../utills/sendEmail";
import { USER_ROLE } from "../user/user.const";
import { MealProvider } from "../mealProvider/mealProvider.model";
import { Customer } from "../customer/customer.model";

const login = async (payload: TLogin) => {
  const email = payload?.email;
  const phone = payload?.phone;
  if (!email && !phone) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "email or phone number is required"
    );
  }
  let isUserExist;
  if (email) {
    isUserExist = await User.findOne({ email: email }).select("+password");
  }
  if (phone) {
    isUserExist = await User.findOne({ phone: phone }).select("+password");
  }
  if (!isUserExist) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "the email or phone number you provided is incorrect"
    );
  }
  const userDelete = isUserExist?.isDeleted;
  if (userDelete) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "the email or phone number you provided does not match"
    );
  }
  const userStatus = isUserExist?.status;
  if (userStatus === "blocked") {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "you are not authorized to login"
    );
  }
  const userPass = isUserExist?.password;
  const isPasswordMatched = await passwordMatching(payload?.password, userPass);
  if (!isPasswordMatched) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "the password you have provided is wrong"
    );
  }
  const jwtPayload = {
    userId: isUserExist?._id.toString(),
    userRole: isUserExist?.role,
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
  return {
    accessToken,
    refreshToken,
  };
};

const changePassword = async (payload: TChangePassword, user: string) => {
  const { oldPassword, newPassword } = payload;
  const saltNumber = config.bcrypt_salt_round as string;
  const isUserExist = await User.findById(user).select("+password");
  const userPassword = isUserExist?.password;
  const isPasswordMatched = await passwordMatching(
    oldPassword,
    userPassword as string
  );
  if (!isPasswordMatched) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "password doesn`t match");
  }
  const hashedPassword = await bcrypt.hash(newPassword, Number(saltNumber));
  const result = await User.findByIdAndUpdate(
    user,
    { password: hashedPassword, passwordChangedAt: new Date() },
    { new: true }
  );
  if (result?.passwordChangedAt) {
    const jwtPayload: TJwtPayload = {
      userId: isUserExist?._id.toString() as string,
      userRole: isUserExist?.role as TUSerRole,
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
    return { accessToken, refreshToken };
  } else {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to change password");
  }
};

const generateAccessToken = async (user: JwtPayload) => {
  const { userId } = user;
  const secret = config.jwt_access_secret as string;

  const isUserExist = await User.findById(userId);
  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "user data not found");
  }
  const jwtPayload: TJwtPayload = {
    userId: isUserExist?._id.toString() as string,
    userRole: isUserExist?.role as TUSerRole,
  };
  const accessToken = createToken(
    jwtPayload,
    secret,
    config.jwt_access_expires_in as string
  );
  return accessToken;
};

const searchWithEmail = async (email: string) => {
  const result = await verifyUserByEmail(email);
  let userInfo;
  if (result?.role === USER_ROLE.mealProvider) {
    userInfo = await MealProvider.findOne({ user: result?._id }).select(
      "name profileImage"
    );
  }
  if (result?.role === USER_ROLE.customer || result?.role === USER_ROLE.admin) {
    userInfo = await Customer.findOne({ user: result?._id }).select(
      "name profileImage"
    );
  }
  if (result?.role === USER_ROLE.superAdmin) {
    userInfo = result;
  }
  if (!userInfo) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      " the email you provided does not found"
    );
  }
  return { userInfo, email: result?.email };
};

const sendOTP = async (email: string) => {
  const result = await verifyUserByEmail(email);
  const newotp = generateOTP().toString();
  const hashedOTP = await bcrypt.hash(
    newotp,
    Number(config.bcrypt_salt_round as string)
  );
  const jwtPayload: TJwtPayload = {
    userId: `${result?._id.toString() as string} ${hashedOTP}`,
    userRole: result?.role as TUSerRole,
  };
  const resetToken = createToken(
    jwtPayload,
    config.jwt_refresh1_secret as string,
    "2m"
  );
  const userEmail = result?.email;
  if (resetToken && newotp) {
    const html = otpEmailTemplate(newotp);
    await sendEmail({
      to: userEmail,
      html,
      subject: "Your one time password(OTP)",
      text: "This one time password is valid for only 5 minutes",
    });
    return resetToken;
  } else {
    throw new AppError(StatusCodes.BAD_REQUEST, "something went wrong");
  }
};

const resetPassword = async (user: JwtPayload, oneTimePass: string) => {
  const { userId } = user;
  const hashedOtp = userId.split(" ")[1];
  const id = userId.split(" ")[0];
  const userInfo = await verifyUser(id);
  const jwtPayload: TJwtPayload = {
    userId: userInfo?._id.toString() as string,
    userRole: userInfo?.role as TUSerRole,
  };
  const otpMatching = await passwordMatching(oneTimePass, hashedOtp);
  if (!otpMatching) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "the otp you have provided is wrong"
    );
  }
  const tokenForSetNewPass = createToken(
    jwtPayload,
    config.jwt_refresh1_secret as string,
    "5m"
  );
  return tokenForSetNewPass;
};

const setNewPassword = async (user: JwtPayload, newPassword: string) => {
  const saltNumber = Number(config.bcrypt_salt_round);
  const { userId } = user;
  const hashedPassword = await bcrypt.hash(newPassword, saltNumber);
  const result = await User.findByIdAndUpdate(
    userId,
    { password: hashedPassword, passwordChangedAt: new Date() },
    { new: true }
  );
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to set new password");
  }
  const jwtPayload: TJwtPayload = {
    userId: result?._id.toString() as string,
    userRole: result?.role as TUSerRole,
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
  return { accessToken, refreshToken };
};

const resendOtp = async (id: string) => {
  const user = await User.findById(id).select("role email");
  if (!user) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to resend the otp");
  }
  const newotp = generateOTP().toString();
  const hashedOTP = await bcrypt.hash(
    newotp,
    Number(config.bcrypt_salt_round as string)
  );
  const jwtPayload: TJwtPayload = {
    userId: `${user?._id.toString() as string} ${hashedOTP}`,
    userRole: user?.role as TUSerRole,
  };
  const refresh1Token = createToken(
    jwtPayload,
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
  return refresh1Token;
};

export const authService = {
  login,
  changePassword,
  generateAccessToken,
  sendOTP,
  resetPassword,
  setNewPassword,
  resendOtp,
  searchWithEmail,
};

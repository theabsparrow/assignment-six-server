import { StatusCodes } from "http-status-codes";
import AppError from "../../error/AppError";
import { TChangePassword, TJwtPayload, TLogin } from "./auth.interface";
import { User } from "../user/user.model";
import {
  createToken,
  generateOTP,
  passwordMatching,
  timeComparison,
  verifyToken,
  verifyUser,
  verifyUserByEmail,
} from "./auth.utills";
import config from "../../config";
import bcrypt from "bcrypt";
import { TUSerRole } from "../user/user.interface";
import { JwtPayload } from "jsonwebtoken";
import { otpEmailTemplate } from "../../utills/otpEmailTemplate";
import { sendEmail } from "../../utills/sendEmail";

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
  await User.findByIdAndUpdate(
    user,
    { password: hashedPassword, passwordChangedAt: new Date() },
    { new: true }
  );

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
};

const generateAccessToken = async (refreshToken: string) => {
  const secret = config.jwt_refresh_secret as string;
  const decoded = verifyToken(refreshToken, secret);
  const { userId, iat } = decoded as JwtPayload;
  const isUserExist = await User.findById(userId);
  if (isUserExist && isUserExist?.passwordChangedAt) {
    const passwordChangedTime = isUserExist?.passwordChangedAt as Date;
    const passwordChangedTimeComparison = timeComparison(
      passwordChangedTime,
      iat as number
    );
    if (passwordChangedTimeComparison) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "you are not authorized");
    }
  }
  const jwtPayload: TJwtPayload = {
    userId: isUserExist?._id.toString() as string,
    userRole: isUserExist?.role as TUSerRole,
  };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );
  return accessToken;
};

const forgetPassword = async (email: string) => {
  const result = await verifyUserByEmail(email);
  const newotp = generateOTP().toString();
  const hashedOTP = await bcrypt.hash(
    newotp,
    Number(config.bcrypt_salt_round as string)
  );
  const jwtPayload: TJwtPayload = {
    userId: result?._id.toString() as string,
    userRole: result?.role as TUSerRole,
    otp: hashedOTP,
  };
  const resetAccessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    "5m"
  );
  const userEmail = result?.email;
  if (resetAccessToken && newotp) {
    const resetToken = resetAccessToken;
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
  const { userId, otp } = user;
  const userInfo = await verifyUser(userId);
  const jwtPayload: TJwtPayload = {
    userId: userInfo?._id.toString() as string,
    userRole: userInfo?.role as TUSerRole,
  };
  const tokenForSetNewPass = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    "5m"
  );
  const otpMatching = await passwordMatching(oneTimePass, otp);
  if (!otpMatching) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "the otp you have provided is wrong"
    );
  }
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

export const authService = {
  login,
  changePassword,
  generateAccessToken,
  forgetPassword,
  resetPassword,
  setNewPassword,
};

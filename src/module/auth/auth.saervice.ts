import { StatusCodes } from "http-status-codes";
import AppError from "../../error/AppError";
import { TLogin } from "./auth.interface";
import { User } from "../user/user.model";
import { createToken, passwordMatching } from "./auth.utills";
import config from "../../config";

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

export const authService = {
  login,
};

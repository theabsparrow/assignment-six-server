import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";
import AppError from "../../error/AppError";
import { StatusCodes } from "http-status-codes";
import { User } from "../user/user.model";

type TJwtPayload = {
  userId: string;
  userRole: string;
};

export const createToken = (
  jwtPayload: TJwtPayload,
  secret: string,
  expiresIn: string
) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string, secret: string) => {
  const decoded = jwt.verify(token, secret);
  return decoded;
};

export const timeComparison = (time: Date, comparedTime: number) => {
  const timeInNumber = new Date(time).getTime() / 1000;
  return timeInNumber > comparedTime;
};

export const passwordMatching = async (password: string, userPass: string) => {
  const result = await bcrypt.compare(password, userPass);
  return result;
};
export const generateOTP = (): number => {
  const number = Math.floor(100000 + Math.random() * 900000);
  return number;
};
export const verifyUser = async (userId: string) => {
  const isUserExist = await User.findById(userId);
  if (!isUserExist) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "faild to generate access token"
    );
  }
  const deleted = isUserExist?.isDeleted;
  if (deleted) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "faild to generate access token"
    );
  }
  const status = isUserExist?.status;
  if (status === "blocked") {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "faild to generate access token"
    );
  }
  return isUserExist;
};
export const verifyUserByEmail = async (email: string) => {
  const isUserExist = await User.findOne({ email: email });
  if (!isUserExist) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "faild to generate access token"
    );
  }
  const deleted = isUserExist?.isDeleted;
  if (deleted) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "faild to generate access token"
    );
  }
  const status = isUserExist?.status;
  if (status === "blocked") {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "faild to generate access token"
    );
  }
  return isUserExist;
};

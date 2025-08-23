/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { TUSerRole } from "../module/user/user.interface";
import { catchAsync } from "../utills/catchAsync";
import AppError from "../error/AppError";
import { StatusCodes } from "http-status-codes";
import { verifyToken } from "../module/auth/auth.utills";
import config from "../config";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../module/user/user.model";

export const verifyOtpToken = (...requiredRoles: TUSerRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "you are not authorized");
    }
    let decoded;

    try {
      decoded = verifyToken(token, config.jwt_refresh1_secret as string);
    } catch (err: any) {
      throw new AppError(StatusCodes.UNAUTHORIZED, `otp expired `);
    }
    const { userId, userRole } = decoded as JwtPayload;

    const id = userId.split(" ")[0];
    const isUserExists = await User.findById(id);
    if (!isUserExists) {
      throw new AppError(StatusCodes.NOT_FOUND, "user does not exist");
    }
    const isUSerDelete = isUserExists?.isDeleted;
    if (isUSerDelete) {
      throw new AppError(StatusCodes.NOT_FOUND, "user does not exist");
    }
    const isUserDeactive = isUserExists?.status;

    if (isUserDeactive === "blocked") {
      throw new AppError(StatusCodes.UNAUTHORIZED, "you are not authortized");
    }
    if (requiredRoles && !requiredRoles.includes(userRole)) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "you are not authortized");
    }
    req.user = decoded as JwtPayload;
    next();
  });
};

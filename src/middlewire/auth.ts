/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utills/catchAsync";
import { StatusCodes } from "http-status-codes";
import { verifyToken } from "../module/auth/auth.utills";
import AppError from "../error/AppError";
import config from "../config";
import { JwtPayload } from "jsonwebtoken";
import { TUSerRole } from "../module/user/user.interface";
import { User } from "../module/user/user.model";

export const auth = (...requiredRoles: TUSerRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "you are not authorized");
    }
    let decoded;
    try {
      decoded = verifyToken(token, config.jwt_access_secret as string);
    } catch (err: any) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        `you are not authorized ${err}`
      );
    }

    const { userId, userRole } = decoded as JwtPayload;

    const isUserExists = await User.findById(userId);
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
    // if (isUserExists?.passwordChangedAt) {
    //   const passwordChangedTime = isUserExists?.passwordChangedAt as Date;
    //   const passwordChangedTimeComparison = timeComparison(
    //     passwordChangedTime,
    //     iat as number
    //   );
    //   if (passwordChangedTimeComparison) {
    //     throw new AppError(StatusCodes.UNAUTHORIZED, "you are not authorized");
    //   }
    // }
    if (requiredRoles && !requiredRoles.includes(userRole)) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "you are not authortized");
    }
    req.user = decoded as JwtPayload;
    next();
  });
};

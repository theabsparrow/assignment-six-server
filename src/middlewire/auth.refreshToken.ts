/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utills/catchAsync";
import AppError from "../error/AppError";
import { StatusCodes } from "http-status-codes";
import { verifyToken } from "../module/auth/auth.utills";
import config from "../config";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../module/user/user.model";
import { TUSerRole } from "../module/user/user.interface";

export const verifyRefreshToken = (...requiredRoles: TUSerRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "you are not authorized");
    }
    let decoded;
    try {
      decoded = verifyToken(refreshToken, config.jwt_refresh_secret as string);
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
    if (requiredRoles && !requiredRoles.includes(userRole)) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "you are not authortized");
    }
    next();
  });
};

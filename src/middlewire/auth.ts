/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { TUSerRole } from "../module/user/user.interface";
import { catchAsync } from "../utills/catchAsync";
import { StatusCodes } from "http-status-codes";
import { verifyToken } from "../module/auth/auth.utills";
import AppError from "../error/AppError";
import config from "../config";
import { JwtPayload } from "jsonwebtoken";

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
    const { userRole } = decoded as JwtPayload;
    if (requiredRoles && !requiredRoles.includes(userRole)) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "you are not authortized");
    }
    req.user = decoded as JwtPayload;
    next();
  });
};

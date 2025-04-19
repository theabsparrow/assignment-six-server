import { AnyZodObject } from "zod";
import { catchAsync } from "../utills/catchAsync";
import { NextFunction, Request, Response } from "express";
import AppError from "../error/AppError";
import { StatusCodes } from "http-status-codes";

const validateCookies = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken1 } = req.cookies;
    if (!refreshToken1) {
      throw new AppError(StatusCodes.GATEWAY_TIMEOUT, "time is expired");
    }
    const data = {
      refreshToken1,
    };
    await schema.parseAsync(data);
    next();
  });
};
export default validateCookies;

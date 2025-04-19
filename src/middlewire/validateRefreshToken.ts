import { AnyZodObject } from "zod";
import { catchAsync } from "../utills/catchAsync";
import { NextFunction, Request, Response } from "express";

const validaterefreshToken = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.cookies;
    const data = {
      refreshToken,
    };
    await schema.parseAsync(data);
    next();
  });
};
export default validaterefreshToken;

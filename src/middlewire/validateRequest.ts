import { AnyZodObject } from "zod";
import { catchAsync } from "../utills/catchAsync";
import { NextFunction, Request, Response } from "express";

const validateRequest = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = {
      ...req.body,
      ...req.cookies,
    };
    await schema.parseAsync(data);
    next();
  });
};
export default validateRequest;

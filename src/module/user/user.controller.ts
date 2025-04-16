/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utills/catchAsync";
import { userService } from "./user.service";
import { sendResponse } from "../../utills/sendResponse";
import { StatusCodes } from "http-status-codes";
import { cookieOptions } from "../auth/auth.const";

const createCustomer = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user, customer } = req.body;
    const result = await userService.createCustomer(user, customer);
    const { accessToken, refreshToken, customerData } = result;
    res.cookie("refreshToken", refreshToken, cookieOptions);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "customer is regestered successfully",
      data: { accessToken, refreshToken, customerData },
    });
  }
);

const createMealProvider = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user, mealProvider } = req.body;
    const result = await userService.createMealProvider(user, mealProvider);
    // const { accessToken, refreshToken, customerData } = result;
    // res.cookie("refreshToken", refreshToken, cookieOptions);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "meal provider is regestered successfully",
      data: result,
    });
  }
);

export const userController = {
  createCustomer,
  createMealProvider,
};

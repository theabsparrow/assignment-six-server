/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utills/catchAsync";
import { userService } from "./user.service";
import { sendResponse } from "../../utills/sendResponse";
import { StatusCodes } from "http-status-codes";
import { cookieOptions, cookieOptions1 } from "../auth/auth.const";
import { JwtPayload } from "jsonwebtoken";

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
    const { accessToken, refreshToken, customerData } = result;
    res.cookie("refreshToken", refreshToken, cookieOptions);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "meal provider is regestered successfully",
      data: { accessToken, refreshToken, customerData },
    });
  }
);

const getMeRoute = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.user as JwtPayload;
    const { userId, userRole } = payload;
    const result = await userService.getMeroute(userId, userRole);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "info is retirved successfully",
      data: result,
    });
  }
);

const deleteMyAccount = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { userId } = user as JwtPayload;
    const result = await userService.dleteMyAccount(userId);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "your account is deleted successfully",
      data: result,
    });
  }
);

const deleteAccount = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { userRole } = user as JwtPayload;
    const id = req.params.id;
    const result = await userService.deleteAccount(id, userRole);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "successfully deleted account",
      data: result,
    });
  }
);

const updatePhoneEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { userId } = user as JwtPayload;
    const payload = req.body;
    const result = await userService.updatePhoneEmail(userId, payload);
    const { updatedNumber, otpToken } = result;
    if (otpToken) {
      res.cookie("refreshToken1", otpToken, cookieOptions1);
    }
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "successfully deleted account",
      data: updatedNumber ? updatedNumber : " ",
    });
  }
);

const verifyEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const { refreshToken1 } = req.cookies;
    const result = await userService.verifyEmail(payload, refreshToken1);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "email verified successfully",
      data: result,
    });
  }
);

export const userController = {
  createCustomer,
  createMealProvider,
  getMeRoute,
  deleteMyAccount,
  deleteAccount,
  updatePhoneEmail,
  verifyEmail,
};

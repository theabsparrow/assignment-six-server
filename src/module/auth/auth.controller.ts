/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utills/catchAsync";
import { authService } from "./auth.saervice";
import { cookieOption2, cookieOptions } from "./auth.const";
import { sendResponse } from "../../utills/sendResponse";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await authService.login(payload);
    const { accessToken, refreshToken } = result;
    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.cookie("accessToken", accessToken, cookieOption2);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "login successfully",
      data: { accessToken, refreshToken },
    });
  }
);

const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("refreshToken", cookieOptions);
    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "successfully logged out" });
  }
);

const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = req.user;
    const { userId } = user;
    const result = await authService.changePassword(payload, userId);
    const { accessToken, refreshToken } = result;
    res.cookie("refreshToken", refreshToken, cookieOptions);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "password changed successfully",
      data: { accessToken, refreshToken },
    });
  }
);

const generateAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const result = await authService.generateAccessToken(user);
    res.cookie("accessToken", result, cookieOption2);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "token generated successfullt",
      data: { accessToken: result },
    });
  }
);

const searchWithEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const result = await authService.searchWithEmail(email);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "user find successfully",
      data: result,
    });
  }
);

const sendOTP = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const result = await authService.sendOTP(email);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "otp generated successfully",
      data: result,
    });
  }
);

const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { otp } = req.body;
    const user = req.user;
    const result = await authService.resetPassword(user, otp);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "password reset successfully",
      data: result,
    });
  }
);

const setNewPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { newPassword } = req.body;
    const user = req.user;
    const result = await authService.setNewPassword(user, newPassword);
    const { accessToken, refreshToken } = result;
    res.cookie("refreshToken", refreshToken, cookieOptions);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "new password set successfully",
      data: { accessToken, refreshToken },
    });
  }
);

const resendOtp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { userId } = user as JwtPayload;
    const result = await authService.resendOtp(userId);
    res.cookie("refresh1Token", result, cookieOptions);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "new otp sent successfully",
      data: result,
    });
  }
);

export const authController = {
  login,
  logout,
  changePassword,
  generateAccessToken,
  sendOTP,
  resetPassword,
  setNewPassword,
  resendOtp,
  searchWithEmail,
};

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utills/catchAsync";
import { authService } from "./auth.saervice";
import { cookieOptions } from "./auth.const";
import { sendResponse } from "../../utills/sendResponse";
import { StatusCodes } from "http-status-codes";

const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await authService.login(payload);
    const { accessToken, refreshToken } = result;
    res.cookie("refreshToken", refreshToken, cookieOptions);
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

export const authController = {
  login,
  logout,
};

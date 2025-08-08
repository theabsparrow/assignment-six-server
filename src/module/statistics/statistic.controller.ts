/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utills/catchAsync";
import { sendResponse } from "../../utills/sendResponse";
import { StatusCodes } from "http-status-codes";
import { statisticService } from "./statistic.service";

const getUsersStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await statisticService.getUsersStats();
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "user stats are retrived successfully",
      data: result,
    });
  }
);

const getSubsCribersStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await statisticService.getSubsCribersStats();
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "subscriber stats are retrived successfully",
      data: result,
    });
  }
);

const getKitchensStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await statisticService.getKitchenStats();
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "kitchen stats are retrived successfully",
      data: result,
    });
  }
);

const getMealStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await statisticService.getMealStats();
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "meal stats are retrived successfully",
      data: result,
    });
  }
);

const getBlogStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await statisticService.getAllBlogs();
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Blog stats are retrived successfully",
      data: result,
    });
  }
);

export const statsController = {
  getUsersStats,
  getSubsCribersStats,
  getKitchensStats,
  getMealStats,
  getBlogStats,
};

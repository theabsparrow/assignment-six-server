/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utills/catchAsync";
import { sendResponse } from "../../utills/sendResponse";
import { StatusCodes } from "http-status-codes";
import { searchLogService } from "./searchLogService";

const getSearchMeals = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await searchLogService.getTopSearchQuery();
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "meals are retrived successfully",
      data: result,
    });
  }
);

export const searchLogController = {
  getSearchMeals,
};

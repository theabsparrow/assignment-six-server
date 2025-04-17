/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utills/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { mealProviderService } from "./mealProvider.service";
import { sendResponse } from "../../utills/sendResponse";
import { StatusCodes } from "http-status-codes";

const getAllMealProviders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { userRole } = user as JwtPayload;
    const query = req.query;
    const result = await mealProviderService.getAllMealProvider(
      userRole,
      query
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "meal providers are retrived successfully",
      data: result,
    });
  }
);

const getASingleMealProvider = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await mealProviderService.getASingleMealProvider(id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "meal provider is retrived successfully",
      data: result,
    });
  }
);

export const mealProviderController = {
  getAllMealProviders,
  getASingleMealProvider,
};

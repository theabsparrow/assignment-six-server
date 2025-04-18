/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utills/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { kitchenService } from "./kitchen.service";
import { sendResponse } from "../../utills/sendResponse";
import { StatusCodes } from "http-status-codes";

const createKitchen = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const payload = req.body;
    const { userId } = user as JwtPayload;
    const result = await kitchenService.createKitchen(userId, payload);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "kitchen created successfully successfully",
      data: result,
    });
  }
);

const getAllKitchen = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const query = req.query;
    const result = await kitchenService.getAllKitchen(user, query);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "kitchens are retrived successfully",
      data: result,
    });
  }
);

const getASingleKitchen = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await kitchenService.getASingleKitchen(id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "kitchen information is retrived successfully",
      data: result,
    });
  }
);
export const kitchenController = {
  createKitchen,
  getAllKitchen,
  getASingleKitchen,
};

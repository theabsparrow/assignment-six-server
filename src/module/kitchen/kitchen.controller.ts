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
      message: "kitchen created successfully",
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

const getMyKitchen = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { userId } = user as JwtPayload;
    const result = await kitchenService.getMyKitchen(userId);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "kitchen information is retrived successfully",
      data: result,
    });
  }
);

const updateKitchenInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = req.user;
    const result = await kitchenService.updateKitchen({ payload, user });
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "kitchen information is updated successfully",
      data: result,
    });
  }
);

const deleteMyKitchen = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = req.user;
    const { userId } = user as JwtPayload;
    const result = await kitchenService.deleteMyKitchen(userId, payload);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "kitchen is deleted successfully",
      data: result,
    });
  }
);

const deleteKitche = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await kitchenService.deleteKitchen(id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "kitchen is deleted successfully",
      data: result,
    });
  }
);

const updateStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const id = req.params.id;
    const result = await kitchenService.updateStatus(id, payload);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "kitchen status is updated successfully",
      data: result,
    });
  }
);

export const kitchenController = {
  createKitchen,
  getAllKitchen,
  getASingleKitchen,
  updateKitchenInfo,
  getMyKitchen,
  deleteMyKitchen,
  deleteKitche,
  updateStatus,
};

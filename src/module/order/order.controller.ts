/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utills/catchAsync";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utills/sendResponse";
import { StatusCodes } from "http-status-codes";
import { orderService } from "./order.service";

const createOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { userId } = user as JwtPayload;
    const payload = req.body;
    const id = req.params.id;
    const result = await orderService.createOrder({ id, userId, payload });
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "order placed successfully",
      data: result,
    });
  }
);

const changeOrderStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { status } = req.body;
    const id = req.params.id;
    const result = await orderService.changeOrderStatus({ user, id, status });
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "order status changed successfully",
      data: result,
    });
  }
);

const updateDeliveryCount = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const user = req.user;
    const result = await orderService.updateDeliveryCount(id, user);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "delivery count updated successfully",
      data: result,
    });
  }
);

export const orderController = {
  createOrder,
  changeOrderStatus,
  updateDeliveryCount,
};

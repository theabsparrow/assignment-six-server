/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utills/catchAsync";
import { sendResponse } from "../../utills/sendResponse";
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { notificationService } from "./notification.service";

const getMyNotifications = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { userId } = user as JwtPayload;
    const query = req.query;
    const result = await notificationService.getMyNotification(userId, query);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "notifications are retrived successfully",
      data: result,
    });
  }
);

const updateNotification = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { userId } = user as JwtPayload;
    const id = req.params.id;
    const result = await notificationService.updateNotification(id, userId);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "notification read successfully",
      data: result,
    });
  }
);

const deleteNotification = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { userId } = user as JwtPayload;
    const id = req.params.id;
    const result = await notificationService.deleteNotification(id, userId);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "notification deleted successfully",
      data: result,
    });
  }
);

export const notificationController = {
  getMyNotifications,
  updateNotification,
  deleteNotification,
};

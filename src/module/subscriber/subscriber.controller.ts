/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utills/catchAsync";
import { sendResponse } from "../../utills/sendResponse";
import { NextFunction, Request, Response } from "express";
import { subscriberService } from "./subscriber.service";

const createSubscriber = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await subscriberService.createSubscriber(payload);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "subscribed successfully",
      data: result,
    });
  }
);

const getAllSubscriber = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await subscriberService.getAllSubscriber(query);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "subscriberes are retirved successfully",
      data: result,
    });
  }
);

const updateStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const payload = req.body;
    const result = await subscriberService.updateStatus(id, payload);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "status is changed successfully",
      data: result,
    });
  }
);

const deleteSubscriber = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await subscriberService.deleteSubscriber(id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "subscriber is deleted successfully",
      data: result,
    });
  }
);

export const subscriberController = {
  createSubscriber,
  getAllSubscriber,
  updateStatus,
  deleteSubscriber,
};

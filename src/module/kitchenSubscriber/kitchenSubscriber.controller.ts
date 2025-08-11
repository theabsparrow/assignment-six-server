/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utills/catchAsync";
import { sendResponse } from "../../utills/sendResponse";
import { StatusCodes } from "http-status-codes";
import { kitchenSubscriberService } from "./kitchenSubscriber.service";
import { JwtPayload } from "jsonwebtoken";

const addSubscriber = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const id = req.params.id;
    const result = await kitchenSubscriberService.addSubscriber(user, id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "subscribed successfully",
      data: result,
    });
  }
);

const removeSubscriber = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const { userId } = user;
    const id = req.params.id;
    const result = await kitchenSubscriberService.removeSubscriber(id, userId);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "unsubscribed successfully",
      data: result,
    });
  }
);

const getMyAllSubscription = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const { userId } = user;
    const result = await kitchenSubscriberService.getMyAllSubscription(userId);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "subscriptions are retrived successfully",
      data: result,
    });
  }
);

const isSubscribedKitchen = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const { userId } = user;
    const id = req.params.id;
    const result = await kitchenSubscriberService.isSubscribedKitchen(
      id,
      userId
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "you are a subscriber of this kitchen",
      data: result,
    });
  }
);

export const kitchenSubscriberController = {
  addSubscriber,
  removeSubscriber,
  getMyAllSubscription,
  isSubscribedKitchen,
};

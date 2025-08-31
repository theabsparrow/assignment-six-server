/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utills/catchAsync";
import { sendResponse } from "../../utills/sendResponse";
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { ratingService } from "./rating.service";

const addRating = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { userId } = user as JwtPayload;
    const payload = req.body;
    const id = req.params.id;
    const result = await ratingService.addRating({ payload, userId, id });
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "you have reviewed successfully",
      data: result,
    });
  }
);

const removeRating = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const id = req.params.id;
    const result = await ratingService.removeRating(id, user);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "you have deleted your review successfully",
      data: result,
    });
  }
);

const getMyFeedbacks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { userId } = user;
    const query = req.query;
    const result = await ratingService.getMyFeedbacks(userId, query);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "feedbacks are retrived successfully",
      data: result,
    });
  }
);

export const ratingController = {
  addRating,
  removeRating,
  getMyFeedbacks,
};

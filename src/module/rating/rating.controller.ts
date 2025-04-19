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
      message: "you have rated successfully",
      data: result,
    });
  }
);

export const ratingController = {
  addRating,
};

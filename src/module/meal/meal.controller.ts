/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utills/catchAsync";
import { sendResponse } from "../../utills/sendResponse";
import { NextFunction, Request, Response } from "express";
import { mealService } from "./meal.service";

const createMeal = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const payload = req.body;
    const result = await mealService.createMeal(user, payload);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "meal is created successfully",
      data: result,
    });
  }
);

const getAllMeals = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await mealService.getAllMeals(query);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "meals are retrived successfully",
      data: result,
    });
  }
);

const getASingleMeal = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await mealService.getASingleMeal(id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "meal is retrived successfully",
      data: result,
    });
  }
);

export const mealController = {
  createMeal,
  getAllMeals,
  getASingleMeal,
};

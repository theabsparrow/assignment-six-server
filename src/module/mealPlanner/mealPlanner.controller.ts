/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utills/catchAsync";
import { NextFunction, Request, Response } from "express";
import { mealPlannerService } from "./mealplanner.service";
import { sendResponse } from "../../utills/sendResponse";
import { StatusCodes } from "http-status-codes";

const createMealPlanner = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const payload = req.body;
    const { userId } = user as JwtPayload;
    const result = await mealPlannerService.createMealPlan(payload, userId);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "meal planner created successfully",
      data: result,
    });
  }
);

const getMyPlans = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const user = req.user;
    const { userId } = user;
    const result = await mealPlannerService.getMyMealPlans(userId, query);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "plans are retrived successfully",
      data: result,
    });
  }
);

const getASingleMyPlan = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const id = req.params.id;
    const result = await mealPlannerService.getASingleMyPlan(user, id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "plan is retrived successfully",
      data: result,
    });
  }
);

const updateMealPlanner = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const payload = req.body;
    const user = req.user;
    const result = await mealPlannerService.updateMealPlan({
      id,
      payload,
      user,
    });
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "meal plan info is updated successfully",
      data: result,
    });
  }
);

const deleteMyplan = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const user = req.user;
    const result = await mealPlannerService.deleteMyplan({
      id,
      user,
    });
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "meal plan  is deleted successfully",
      data: result,
    });
  }
);

export const mealPlannerController = {
  createMealPlanner,
  getMyPlans,
  getASingleMyPlan,
  updateMealPlanner,
  deleteMyplan,
};

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utills/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { customerService } from "./customer.service";
import { sendResponse } from "../../utills/sendResponse";
import { StatusCodes } from "http-status-codes";

const getAllCustomer = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { userRole } = user as JwtPayload;
    const query = req.query;
    const result = await customerService.getAllCustomer(userRole, query);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "customer data retrived successfully",
      data: result,
    });
  }
);

const getASingleCustomer = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await customerService.getASingleCustomer(id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "customer data is retrived successfully",
      data: result,
    });
  }
);

const updateCustomerInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { userId } = user as JwtPayload;
    const payload = req.body;
    const result = await customerService.updateCustomerInfo(userId, payload);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "customer data updated successfully",
      data: result,
    });
  }
);

export const customerController = {
  getAllCustomer,
  getASingleCustomer,
  updateCustomerInfo,
};

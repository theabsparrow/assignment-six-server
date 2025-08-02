/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utills/catchAsync";
import { sendResponse } from "../../utills/sendResponse";
import { NextFunction, Request, Response } from "express";
import { blogService } from "./blog.service";

const createBlog = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const { userId } = req.user;
    const result = await blogService.createBlog(userId, payload);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Blog posted successfully",
      data: result,
    });
  }
);

const getAllBlogs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await blogService.getAllBlogs(query);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Blogs are retirved successfully",
      data: result,
    });
  }
);

const getASingleBlog = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await blogService.getASingleBlog(id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Blog is retirved successfully",
      data: result,
    });
  }
);

const updateBlog = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const payload = req.body;
    const user = req.user;
    const result = await blogService.updateBlog({ user, payload, id });
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Blog is updated successfully",
      data: result,
    });
  }
);

const deleteBlog = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const user = req.user;
    const result = await blogService.deleteBlog(id, user);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Blog is deleted successfully",
      data: result,
    });
  }
);

export const blogController = {
  createBlog,
  getAllBlogs,
  getASingleBlog,
  updateBlog,
  deleteBlog,
};

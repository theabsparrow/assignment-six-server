/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types } from "mongoose";
import { IBlog, TBlog } from "./blog.inteface";
import { Blog } from "./blog.model";
import AppError from "../../error/AppError";
import { StatusCodes } from "http-status-codes";
import QueryBuilder from "../../builder/QueryBuilder";
import { JwtPayload } from "jsonwebtoken";
import { USER_ROLE } from "../user/user.const";
import { User } from "../user/user.model";
import { MealProvider } from "../mealProvider/mealProvider.model";
import { Customer } from "../customer/customer.model";

const createBlog = async (id: string, payload: TBlog) => {
  const user = await User.findById(id).select("email role");
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "user data not found");
  }
  if (user?.role === USER_ROLE.mealProvider) {
    const provider = await MealProvider.findOne({ user: user?._id }).select(
      "name"
    );
    if (!provider) {
      throw new AppError(StatusCodes.NOT_FOUND, "user data not found");
    }
    payload.name = provider?.name;
  }
  if (user?.role === USER_ROLE.admin) {
    const admin = await Customer.findOne({ user: user?._id }).select("name");
    if (!admin) {
      throw new AppError(StatusCodes.NOT_FOUND, "user data not found");
    }
    payload.name = admin?.name;
  }

  payload.excerpts = payload.content.slice(0, 250);
  payload.authorId = new Types.ObjectId(id);

  const result = await Blog.create(payload);
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to post blog");
  }
  return result;
};

const getAllBlogs = async (query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = {};
  filter.isDeleted = false;
  filter.status = "published";
  query = { ...query, ...filter };
  const blogQuery = new QueryBuilder(Blog.find(), query)
    .search(["title", "tags"])
    .filter()
    .sort()
    .paginateQuery()
    .fields();
  const result = await blogQuery.modelQuery;
  const meta = await blogQuery.countTotal();
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found");
  }
  return { meta, result };
};

const getAllBlogsList = async (query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = {};
  filter.isDeleted = false;
  query = {
    ...query,
    fields: "authorId, name, title, status, createdAt, view",
    ...filter,
  };
  const blogQuery = new QueryBuilder(Blog.find().populate("authorId"), query)
    .search(["title", "name"])
    .filter()
    .sort()
    .paginateQuery()
    .fields();
  const result = await blogQuery.modelQuery;
  const meta = await blogQuery.countTotal();
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found");
  }
  return { meta, result };
};

const getASingleBlog = async (id: string) => {
  const isBlogExists = await Blog.findById(id);
  if (!isBlogExists) {
    throw new AppError(StatusCodes.BAD_REQUEST, "blog not found");
  }
  if (isBlogExists.isDeleted) {
    throw new AppError(StatusCodes.BAD_REQUEST, "blog not found");
  }
  const blog = await Blog.findOneAndUpdate(
    { _id: isBlogExists?._id },
    { $inc: { view: 1 } },
    { new: true }
  );

  if (!blog) {
    throw new AppError(StatusCodes.BAD_REQUEST, "blog not found");
  }
  const result = await Blog.findById(blog?._id);
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, "blog not found");
  }
  return result;
};

const getBlogProfile = async (id: string) => {
  const result = await Blog.findById(id)
    .select("-updatedAt -excerpts")
    .populate({ path: "authorId", select: "role" });
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "this blog doesn`t exists");
  }
  if (result?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "this blog doesn`t exists");
  }
  return result;
};

const updateBlog = async ({
  user,
  payload,
  id,
}: {
  user: JwtPayload;
  payload: Partial<IBlog>;
  id: string;
}) => {
  const { userId, userRole } = user;
  const isBlogExists = await Blog.findById(id);
  if (!isBlogExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "blog not found");
  }
  if (isBlogExists?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "blog not found");
  }
  if (
    userRole === USER_ROLE.mealProvider &&
    userId !== isBlogExists?.authorId.toString()
  ) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "you are unauthorized");
  }
  if (payload?.content) {
    payload.excerpts = payload.content.slice(0, 250);
  }
  const { addTags, removeTags, ...remaining } = payload;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const updatedBasicData = await Blog.findByIdAndUpdate(id, remaining, {
      session,
      new: true,
      runValidators: true,
    });
    if (!updatedBasicData) {
      throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
    }
    if (removeTags && removeTags.length > 0) {
      const updated = await Blog.findByIdAndUpdate(
        id,
        { $pull: { tags: { $in: removeTags } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    if (addTags && addTags.length > 0) {
      const updated = await Blog.findByIdAndUpdate(
        id,
        { $addToSet: { tags: { $each: addTags } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    await session.commitTransaction();
    await session.endSession();
    const updatedData = await Blog.findById(id);
    return updatedData;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

const deleteBlog = async (id: string, user: JwtPayload) => {
  const { userId, userRole } = user;
  const isBlogExists = await Blog.findById(id);
  if (!isBlogExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "blog not found");
  }
  if (isBlogExists?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "blog not found");
  }
  if (
    userRole === USER_ROLE.mealProvider &&
    userId !== isBlogExists?.authorId.toString()
  ) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "you are unauthorized");
  }
  const result = await Blog.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to update blog info");
  }
  return result;
};

export const blogService = {
  createBlog,
  getAllBlogs,
  getASingleBlog,
  updateBlog,
  deleteBlog,
  getAllBlogsList,
  getBlogProfile,
};

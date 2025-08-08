/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../error/AppError";
import { Customer } from "../customer/customer.model";
import { TRating } from "./rating.interface";
import { Meal } from "../meal/meal.model";
import { Rating } from "./rating.model";
import mongoose from "mongoose";
import { User } from "../user/user.model";

const addRating = async ({
  payload,
  userId,
  id,
}: {
  payload: TRating;
  userId: string;
  id: string;
}) => {
  const isUSerExists = await User.findById(userId);
  if (!isUSerExists) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to create a kitchen");
  }
  if (!isUSerExists?.verifiedWithEmail) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "you need to verify your email at first"
    );
  }
  const isCustomerExist = await Customer.findOne({
    user: isUSerExists?._id,
  }).select("user");
  if (!isCustomerExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "customer data not matched");
  }
  const isMealExists = await Meal.findById(id).select("owner");
  if (!isMealExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "meal data not matched");
  }
  if (isMealExists?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "meal data not matched");
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const isAlreadyRated = await Rating.findOne({
      userId: isCustomerExist?._id,
      mealId: isMealExists?._id,
    });
    let ratingResult = null;
    if (isAlreadyRated) {
      ratingResult = await Rating.findOneAndUpdate(
        { userId: isCustomerExist?._id, mealId: isMealExists?._id },
        payload,
        { session, new: true, runValidators: true }
      );
      if (!ratingResult) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update rating");
      }
    } else {
      payload.userId = isCustomerExist?._id;
      payload.mealId = isMealExists?._id;
      ratingResult = await Rating.create([payload], { session });
      if (!ratingResult) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to rate this meal");
      }
    }
    const allRatings = await Rating.find({ mealId: isMealExists?._id }).session(
      session
    );
    if (!allRatings.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, "faild to rate this meal");
    }
    const totalRatings = allRatings.reduce(
      (acc, item) => acc + item?.rating,
      0
    );
    const avarageRating = Number(
      (totalRatings / allRatings?.length).toFixed(1)
    );

    const result = await Meal.findByIdAndUpdate(
      isMealExists?._id,
      { rating: avarageRating, $inc: { ratingCount: 1 } },
      { session, new: true, runValidators: true }
    );
    if (!result) {
      throw new AppError(StatusCodes.BAD_REQUEST, "faild to rate this meal");
    }
    await session.commitTransaction();
    await session.endSession();
    return result;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

const removeRating = async (id: string, userId: string) => {
  const isCustomerExist = await Customer.findOne({
    user: userId,
  }).select("name");
  if (!isCustomerExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "customer data not matched");
  }
  const isRatingExists = await Rating.findById(id).select("userId mealId");
  if (!isRatingExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "rating data not found");
  }
  if (isCustomerExist._id.toString() !== isRatingExists.userId.toString()) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "you are unauthorized");
  }
  const isMealExists = await Meal.findById(isRatingExists?._id).select("owner");
  if (!isMealExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "meal data not matched");
  }
  if (isMealExists?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "meal data not matched");
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const deleteRating = await Rating.findByIdAndDelete(isRatingExists?._id, {
      session,
      new: true,
      runValidators: true,
    });
    if (!deleteRating) {
      throw new AppError(StatusCodes.BAD_REQUEST, "failed to delete rating");
    }
    const allRatings = await Rating.find({ mealId: isMealExists?._id }).session(
      session
    );
    if (!allRatings.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, "faild to remove rating");
    }
    const totalRatings = allRatings.reduce(
      (acc, item) => acc + item?.rating,
      0
    );
    const avarageRating = Number(
      (totalRatings / allRatings?.length).toFixed(1)
    );
    const result = await Meal.findByIdAndUpdate(
      isMealExists?._id,
      { rating: avarageRating, $inc: { ratingCount: -1 } },
      { session, new: true, runValidators: true }
    );
    if (!result) {
      throw new AppError(StatusCodes.BAD_REQUEST, "faild to remove rating");
    }
    await session.commitTransaction();
    await session.endSession();
    return result;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

export const ratingService = {
  addRating,
  removeRating,
};

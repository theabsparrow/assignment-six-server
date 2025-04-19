/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../error/AppError";
import { Customer } from "../customer/customer.model";
import { TRating } from "./rating.interface";
import { Meal } from "../meal/meal.model";
import { Rating } from "./rating.model";
import mongoose from "mongoose";

const addRating = async ({
  payload,
  userId,
  id,
}: {
  payload: TRating;
  userId: string;
  id: string;
}) => {
  const isCustomerExist = await Customer.findOne({ user: userId }).select(
    "user"
  );
  if (!isCustomerExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "customer data not matched");
  }
  const isMealExists = await Meal.findById(id).select("owner");
  if (!isMealExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "meal data not matched");
  }
  payload.userId = isCustomerExist?._id;
  payload.mealId = isMealExists?._id;
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
        { rating: payload?.rating },
        { session, new: true, runValidators: true }
      );
      if (!ratingResult) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update rating");
      }
    } else {
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
    const avarageRating = totalRatings / allRatings?.length;

    const result = await Meal.findByIdAndUpdate(
      isMealExists?._id,
      { rating: avarageRating },
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

export const ratingService = {
  addRating,
};

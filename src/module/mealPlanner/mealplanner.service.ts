/* eslint-disable @typescript-eslint/no-explicit-any */

import { StatusCodes } from "http-status-codes";
import AppError from "../../error/AppError";
import { Customer } from "../customer/customer.model";
import { TExtendedMealPlanner, TMealPlanner } from "./mealPlanner.interface";
import { MealPlanner } from "./mealPlanner.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";

const createMealPlan = async (payload: TMealPlanner, userId: string) => {
  const customerId = await Customer.findOne({ user: userId }).select("email");
  if (!customerId) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to create planner");
  }
  const isTitleExist = await MealPlanner.find({
    customer: customerId?._id,
    title: payload?.title,
  }).select("customer title");
  if (isTitleExist.length) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "this title is already exist in you plan"
    );
  }
  payload.customer = customerId?._id;
  const result = await MealPlanner.create(payload);
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to create planner");
  }
  return result;
};

const getMyMealPlans = async (id: string, query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = {};
  const isCustomerExist = await Customer.findOne({ user: id }).select("email");
  if (!isCustomerExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "data not dound");
  }
  filter.customer = isCustomerExist?._id;
  query = { ...query, ...filter };
  const getMyPlansQuery = new QueryBuilder(
    MealPlanner.find().populate("customer"),
    query
  )
    .search(["title"])
    .filter()
    .sort()
    .paginateQuery()
    .fields();
  const result = await getMyPlansQuery.modelQuery;
  const meta = await getMyPlansQuery.countTotal();

  return { meta, result };
};

const getASingleMyPlan = async (user: JwtPayload, id: string) => {
  const { userId } = user;
  const isCustomerExist = await Customer.findOne({ user: userId }).select(
    "email"
  );
  if (!isCustomerExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "data not dound");
  }
  const result = await MealPlanner.findById(id).populate("customer");
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "data not dound");
  }
  if (isCustomerExist?._id.toString() !== result?.customer?._id.toString()) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "you are not permitted to view this plan"
    );
  }
  return result;
};

const updateMealPlan = async ({
  id,
  payload,
  user,
}: {
  id: string;
  payload: Partial<TExtendedMealPlanner>;
  user: JwtPayload;
}) => {
  const { userId } = user;
  const mealPlannerExist = await MealPlanner.findById(id).select("customer");
  if (!mealPlannerExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "data not dound");
  }
  const isCustomer = await Customer.findOne({ user: userId }).select("email");
  if (!isCustomer) {
    throw new AppError(StatusCodes.NOT_FOUND, "data not dound");
  }
  if (mealPlannerExist?.customer.toString() !== isCustomer?._id.toString()) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "you can`t update this kitchen info"
    );
  }
  const {
    addPreferredMealTime,
    removePreferredMealTime,
    addFoodPreference,
    removeFoodPreference,
    addPreferredMealDay,
    removePreferredMealDay,
    addDietaryPreferences,
    removeDietaryPreferences,
    ...remainingData
  } = payload;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const updatedBasicData = await MealPlanner.findByIdAndUpdate(
      id,
      remainingData,
      { session, new: true, runValidators: true }
    );
    if (!updatedBasicData) {
      throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
    }

    // food preference
    if (removeFoodPreference && removeFoodPreference.length > 0) {
      const updated = await MealPlanner.findByIdAndUpdate(
        id,
        { $pull: { foodPreference: { $in: removeFoodPreference } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    if (addFoodPreference && addFoodPreference.length > 0) {
      const updated = await MealPlanner.findByIdAndUpdate(
        id,
        { $addToSet: { foodPreference: { $each: addFoodPreference } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }

    // preferred meal time
    if (removePreferredMealTime && removePreferredMealTime.length > 0) {
      const updated = await MealPlanner.findByIdAndUpdate(
        id,
        { $pull: { preferredMealTime: { $in: removePreferredMealTime } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    if (addPreferredMealTime && addPreferredMealTime.length > 0) {
      const updated = await MealPlanner.findByIdAndUpdate(
        id,
        { $addToSet: { preferredMealTime: { $each: addPreferredMealTime } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }

    // preferred meal day
    if (removePreferredMealDay && removePreferredMealDay.length > 0) {
      const updated = await MealPlanner.findByIdAndUpdate(
        id,
        { $pull: { preferredMealDay: { $in: removePreferredMealDay } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    if (addPreferredMealDay && addPreferredMealDay.length > 0) {
      const updated = await MealPlanner.findByIdAndUpdate(
        id,
        { $addToSet: { preferredMealDay: { $each: addPreferredMealDay } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }

    // diatery preference
    if (removeDietaryPreferences && removeDietaryPreferences.length > 0) {
      const updated = await MealPlanner.findByIdAndUpdate(
        id,
        { $pull: { dietaryPreferences: { $in: removeDietaryPreferences } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    if (addDietaryPreferences && addDietaryPreferences.length > 0) {
      const updated = await MealPlanner.findByIdAndUpdate(
        id,
        { $addToSet: { dietaryPreferences: { $each: addDietaryPreferences } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    await session.commitTransaction();
    await session.endSession();
    const updatedData = await MealPlanner.findById(id).populate("customer");
    return updatedData;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

export const mealPlannerService = {
  createMealPlan,
  getMyMealPlans,
  getASingleMyPlan,
  updateMealPlan,
};

/* eslint-disable @typescript-eslint/no-explicit-any */

import { StatusCodes } from "http-status-codes";
import AppError from "../../error/AppError";
import { TExtendedKitchen, TKitchen } from "./kitchen.interface";
import { Kitchen } from "./kitchen.model";
import { MealProvider } from "../mealProvider/mealProvider.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { JwtPayload } from "jsonwebtoken";
import { USER_ROLE } from "../user/user.const";
import mongoose from "mongoose";

const createKitchen = async (id: string, payload: TKitchen) => {
  const isMealProvider = await MealProvider.findOne({ user: id }).select(
    "email"
  );
  if (!isMealProvider) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to create a kitchen");
  }
  payload.owner = isMealProvider?._id;
  const isKitchenExist = await Kitchen.findOne({ owner: isMealProvider?._id });
  if (isKitchenExist) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "you have already a kitchen, so you can`t create another"
    );
  }
  const kitchenEmail = payload?.email || isMealProvider?.email;
  const isEmailExist = await Kitchen.findOne({ email: kitchenEmail }).select(
    "email"
  );

  if (isEmailExist) {
    throw new AppError(StatusCodes.CONFLICT, "this email is already exists");
  }
  const isPhoneExist = await Kitchen.findOne({
    phoneNumber: payload?.phoneNumber,
  });
  if (isPhoneExist) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "this phone number is already exists"
    );
  }
  const modifiedData = {
    ...payload,
    email: kitchenEmail,
  };
  if (payload?.kitchenType === "Commercial" && !payload.licenseOrCertificate) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "commercial kitchen must have a license or certificate"
    );
  }

  const result = await Kitchen.create(modifiedData);
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to create a kitchen");
  }
  return result;
};

const getAllKitchen = async (
  user: JwtPayload,
  query: Record<string, unknown>
) => {
  const { userRole } = user;

  const filter: Record<string, unknown> = {};
  if (
    userRole === USER_ROLE.customer ||
    userRole === USER_ROLE["meal provider"]
  ) {
    filter.isDeleted = false;
    filter.isActive = true;
  }
  query = { ...query, ...filter };
  const kitchenQuery = new QueryBuilder(Kitchen.find().populate("owner"), query)
    .search(["licenseOrCertificate", "kitchenName"])
    .filter()
    .sort()
    .paginateQuery()
    .fields();
  const result = await kitchenQuery.modelQuery;
  const meta = await kitchenQuery.countTotal();
  return { meta, result };
};

const getASingleKitchen = async (id: string) => {
  const result = await Kitchen.findById(id).populate("owner");
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "this kitchen does not exist");
  }
  if (result?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "this kitchen does not exist");
  }
  if (!result?.isActive) {
    throw new AppError(StatusCodes.NOT_FOUND, "this kitchen does not exist");
  }
  return result;
};

const updateKitchen = async ({
  id,
  payload,
  user,
}: {
  id: string;
  payload: Partial<TExtendedKitchen>;
  user: JwtPayload;
}) => {
  const { userId } = user;
  const isKitchenExist = await Kitchen.findById(id).select("owner");
  if (!isKitchenExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "data not dound");
  }
  const isMealProvider = await MealProvider.findOne({ user: userId }).select(
    "email"
  );
  if (!isMealProvider) {
    throw new AppError(StatusCodes.NOT_FOUND, "data not dound");
  }
  if (isKitchenExist?.owner.toString() !== isMealProvider?._id.toString()) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "you can`t update this kitchen info"
    );
  }
  const {
    addFoodPreference,
    removeFoodPreference,
    addMealTimePerDay,
    removeMealTimePerDay,
    addCookingDays,
    removeCookingDays,
    addSpecialEquipments,
    removeSpecialEquipments,
    ...remainingData
  } = payload;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const updatedBasicData = await Kitchen.findByIdAndUpdate(
      id,
      remainingData,
      { session, new: true, runValidators: true }
    );
    if (!updatedBasicData) {
      throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
    }
    // food preference
    if (removeFoodPreference && removeFoodPreference.length > 0) {
      const updated = await Kitchen.findByIdAndUpdate(
        id,
        { $pull: { foodPreference: removeFoodPreference } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    if (addFoodPreference && addFoodPreference.length > 0) {
      const updated = await Kitchen.findByIdAndUpdate(
        id,
        { $addToSet: { foodPreference: { $each: addFoodPreference } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    // meal time per day
    if (removeMealTimePerDay && removeMealTimePerDay.length > 0) {
      const updated = await Kitchen.findByIdAndUpdate(
        id,
        { $pull: { mealTimePerDay: removeMealTimePerDay } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    if (addMealTimePerDay && addMealTimePerDay.length > 0) {
      const updated = await Kitchen.findByIdAndUpdate(
        id,
        { $addToSet: { mealTimePerDay: { $each: addMealTimePerDay } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    // cooking day
    if (removeCookingDays && removeCookingDays.length > 0) {
      const updated = await Kitchen.findByIdAndUpdate(
        id,
        { $pull: { cookingDays: removeCookingDays } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    if (addCookingDays && addCookingDays.length > 0) {
      const updated = await Kitchen.findByIdAndUpdate(
        id,
        { $addToSet: { cookingDays: { $each: addCookingDays } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    // special equepment
    if (removeSpecialEquipments && removeSpecialEquipments.length > 0) {
      const updated = await Kitchen.findByIdAndUpdate(
        id,
        { $pull: { specialEquipments: removeSpecialEquipments } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    if (addSpecialEquipments && addSpecialEquipments.length > 0) {
      const updated = await Kitchen.findByIdAndUpdate(
        id,
        { $addToSet: { specialEquipments: { $each: addSpecialEquipments } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    await session.commitTransaction();
    await session.endSession();
    const updatedData = await Kitchen.findById(id).populate("owner");
    return updatedData;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

export const kitchenService = {
  createKitchen,
  getAllKitchen,
  getASingleKitchen,
  updateKitchen,
};

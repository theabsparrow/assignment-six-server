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
import { User } from "../user/user.model";
import { passwordMatching } from "../auth/auth.utills";

const createKitchen = async (id: string, payload: TKitchen) => {
  const isUSerExists = await User.findById(id);
  if (!isUSerExists) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to create a kitchen");
  }
  if (!isUSerExists?.verifiedWithEmail) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "you need to verify your email at first"
    );
  }
  const isMealProvider = await MealProvider.findOne({ user: id }).select(
    "user"
  );
  if (!isMealProvider) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to create a kitchen");
  }
  const isKitchenExist = await Kitchen.findOne({ owner: isMealProvider?._id });
  if (isKitchenExist) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "you have already a kitchen, so you can`t create another"
    );
  }
  if (payload?.kitchenType === "Commercial" && !payload.licenseOrCertificate) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "commercial kitchen must have a license or certificate"
    );
  }
  if (payload?.hygieneCertified && !payload?.hygieneCertificate) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "hygiene certified kitchen must show its certificate"
    );
  }
  payload.owner = isMealProvider?._id;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await Kitchen.create([payload], { session });
    if (!result.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, "faild to create a kitchen");
    }
    const updateMealProvider = await MealProvider.findByIdAndUpdate(
      isMealProvider?._id,
      { hasKitchen: true },
      { new: true, session, runValidators: true }
    );
    if (!updateMealProvider) {
      throw new AppError(StatusCodes.BAD_REQUEST, "faild to create a kitchen");
    }
    await session.commitTransaction();
    await session.endSession();
    return result[0];
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

const getAllKitchen = async (
  user: JwtPayload,
  query: Record<string, unknown>
) => {
  const { userRole } = user;
  const filter: Record<string, unknown> = {};
  filter.isDeleted = false;
  if (query?.isActive && typeof query?.isActive === "string") {
    if (query?.isActive === "true") {
      filter.isActive = true;
    } else if (query?.isActive === "false") {
      filter.isActive = false;
    }
  }
  if (query?.hygieneCertified && typeof query?.hygieneCertified === "string") {
    if (query?.hygieneCertified === "true") {
      filter.hygieneCertified = true;
    } else if (query?.isActive === "false") {
      filter.hygieneCertified = false;
    }
  }
  if (userRole === USER_ROLE.customer || userRole === USER_ROLE.mealProvider) {
    filter.isActive = true;
  }
  query = {
    ...query,
    fields:
      "kitchenName,owner,location, isActive, kitchenType, hygieneCertified, kitchenPhoto, createdAt, subscriber",
    ...filter,
  };
  const kitchenQuery = new QueryBuilder(Kitchen.find().populate("owner"), query)
    .search(["kitchenName", "location"])
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

const getMyKitchen = async (id: string) => {
  const isMealProvider = await MealProvider.findOne({ user: id }).select(
    "user"
  );
  if (!isMealProvider) {
    throw new AppError(StatusCodes.NOT_FOUND, "kitchen not dound");
  }
  const isKitchenExist = await Kitchen.findOne({ owner: isMealProvider?._id });
  if (!isKitchenExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "kitchen not dound");
  }
  if (isKitchenExist?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "kitchen not dound");
  }
  return isKitchenExist;
};

const updateKitchen = async ({
  payload,
  user,
}: {
  payload: Partial<TExtendedKitchen>;
  user: JwtPayload;
}) => {
  const { userId } = user;
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
  const isMealProvider = await MealProvider.findOne({ user: userId }).select(
    "user"
  );
  if (!isMealProvider) {
    throw new AppError(StatusCodes.NOT_FOUND, "data not dound");
  }

  const isKitchenExist = await Kitchen.findOne({
    owner: isMealProvider?._id,
  }).select("owner");
  if (!isKitchenExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "data not dound");
  }
  if (payload?.kitchenType === "Commercial" && !payload.licenseOrCertificate) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "commercial kitchen must have a license or certificate"
    );
  }
  if (payload.hygieneCertified && !payload.hygieneCertificate) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "if your kitchen is hygiene certified then shoow the certificate"
    );
  }
  if (payload?.kitchenType === "Home-based") {
    payload.licenseOrCertificate = "";
  }
  if (!payload.hygieneCertified) {
    payload.hygieneCertificate = "";
  }

  const id = isKitchenExist?._id;
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
        { $pull: { foodPreference: { $in: removeFoodPreference } } },
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
        { $pull: { mealTimePerDay: { $in: removeMealTimePerDay } } },
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
        { $pull: { cookingDays: { $in: removeCookingDays } } },
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
        { $pull: { specialEquipments: { $in: removeSpecialEquipments } } },
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

const deleteMyKitchen = async (id: string, payload: { password: string }) => {
  const isUserExist = await User.findById(id).select("password isDeleted");
  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "user data not found");
  }
  if (!isUserExist?.verifiedWithEmail) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "you need to verify your email at first to delete your kitchen"
    );
  }
  const userPass = isUserExist?.password;
  const isPasswordMatched = await passwordMatching(payload?.password, userPass);
  if (!isPasswordMatched) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "the password you have provided is wrong"
    );
  }
  const mealProvider = await MealProvider.findOne({
    user: isUserExist?._id,
  }).select("user");
  if (!mealProvider) {
    throw new AppError(StatusCodes.NOT_FOUND, "meal provider data not found");
  }
  const isKitchenExists = await Kitchen.findOne({ owner: mealProvider?._id });
  if (!isKitchenExists) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "something went wrong, data not found"
    );
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const deleteKitchen = await Kitchen.findOneAndUpdate(
      { owner: mealProvider?._id },
      { isDeleted: true },
      { new: true, runValidators: true }
    );
    if (!deleteKitchen) {
      throw new AppError(StatusCodes.BAD_REQUEST, "failed to delete kitchen");
    }
    const updateMealProvider = await MealProvider.findByIdAndUpdate(
      mealProvider?._id,
      { hasKitchen: false },
      { new: true, runValidators: true }
    );
    if (!updateMealProvider) {
      throw new AppError(StatusCodes.BAD_REQUEST, "failed to delete kitchen");
    }
    await session.commitTransaction();
    await session.endSession();
    return null;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

const deleteKitchen = async (id: string) => {
  const isKitchenExists = await Kitchen.findById(id).select("isDeleted");
  if (!isKitchenExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "kitchen data not foun");
  }
  const isKitchenDeleted = isKitchenExists?.isDeleted;
  if (isKitchenDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "kitchen data not foun");
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await Kitchen.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true, runValidators: true }
    );
    if (!result) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "faild to delete the kitchen"
      );
    }
    const updateUser = await MealProvider.findByIdAndUpdate(
      isKitchenExists?.owner,
      { hasKitchen: false },
      { new: true, runValidators: true }
    );
    if (!updateUser) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "faild to delete the kitchen"
      );
    }
    await session.commitTransaction();
    await session.endSession();
    return null;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

const updateStatus = async (id: string, payload: { isActive: boolean }) => {
  const isKitchenExists = await Kitchen.findById(id).select("isDeleted");
  if (!isKitchenExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "kitchen data not foun");
  }
  const isKitchenDeleted = isKitchenExists?.isDeleted;
  if (isKitchenDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "kitchen data not foun");
  }
  const result = await Kitchen.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!result) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "faild to update kitchen status"
    );
  }
};

export const kitchenService = {
  createKitchen,
  getAllKitchen,
  getASingleKitchen,
  updateKitchen,
  getMyKitchen,
  deleteMyKitchen,
  deleteKitchen,
  updateStatus,
};

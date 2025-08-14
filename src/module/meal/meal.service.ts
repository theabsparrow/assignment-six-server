/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from "jsonwebtoken";
import { TExtendedMeals, TMeal } from "./meal.interface";
import { MealProvider } from "../mealProvider/mealProvider.model";
import AppError from "../../error/AppError";
import { StatusCodes } from "http-status-codes";
import { Kitchen } from "../kitchen/kitchen.model";
import { Meal } from "./meal.model";
import QueryBuilder from "../../builder/QueryBuilder";
import mongoose from "mongoose";
import { User } from "../user/user.model";
import { searchLogService } from "../searchLog/searchLogService";
import { USER_ROLE } from "../user/user.const";

const createMeal = async (user: JwtPayload, payload: TMeal) => {
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
  const isMealProviderExists = await MealProvider.findOne({
    user: userId,
  }).select("user");
  if (!isMealProviderExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "faild to create meal");
  }
  const isKitchenExists = await Kitchen.findOne({
    owner: isMealProviderExists?._id,
  }).select("_id");
  if (!isKitchenExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "faild to create meal");
  }
  payload.kitchen = isKitchenExists?._id;
  payload.owner = isMealProviderExists?._id;
  const result = await Meal.create(payload);
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to create meal");
  }
  return result;
};

const getAllMeals = async (query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = {};
  filter.isDeleted = false;
  query = { ...query, ...filter };
  const searchTerm = query?.searchTerm;
  if (searchTerm) {
    searchLogService
      .searchLogCreation(searchTerm as string)
      .catch(console.error);
  }
  const getAllMealsQuery = new QueryBuilder(
    Meal.find().populate("kitchen"),
    query
  )
    .search(["title"])
    .filter()
    .sort()
    .paginateQuery()
    .fields();
  const result = await getAllMealsQuery.modelQuery;
  const meta = await getAllMealsQuery.countTotal();
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found");
  }

  return { meta, result };
};

const getAllMealList = async (query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = {};
  filter.isDeleted = false;
  if (query?.isAvailable && typeof query?.isAvailable === "string") {
    if (query?.isAvailable === "true") {
      filter.isAvailable = true;
    } else if (query?.isAvailable === "false") {
      filter.isAvailable = false;
    }
  }
  query = {
    ...query,
    fields:
      "kitchen,title,foodCategory, cuisineType, foodPreference, portionSize, price, isAvailable, createdAt",
    ...filter,
  };

  const getAllMealsQuery = new QueryBuilder(
    Meal.find().populate("kitchen"),
    query
  )
    .search(["title"])
    .filter()
    .sort()
    .paginateQuery()
    .fields();
  const result = await getAllMealsQuery.modelQuery;
  const meta = await getAllMealsQuery.countTotal();
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found");
  }
  return { meta, result };
};

const getMyMeals = async (query: Record<string, unknown>, id: string) => {
  const isMealProviderExists = await MealProvider.findOne({ user: id }).select(
    "user"
  );
  if (!isMealProviderExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found");
  }
  const filter: Record<string, unknown> = {};
  filter.isDeleted = false;
  filter.owner = isMealProviderExists?._id;
  query = {
    ...query,
    fields:
      "title,foodCategory,foodPreference, cuisineType, portionSize, avarageRating, createdAt, isAvailable, price",
    ...filter,
  };
  const getMyMealsQuery = new QueryBuilder(Meal.find(), query)
    .search(["title"])
    .filter()
    .sort()
    .paginateQuery()
    .fields();
  const result = await getMyMealsQuery.modelQuery;
  const meta = await getMyMealsQuery.countTotal();
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found");
  }
  return { meta, result };
};

const getMyMealDetails = async (userId: string, id: string) => {
  const isMealExists = await Meal.findById(id);
  if (!isMealExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found");
  }
  if (isMealExists?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found");
  }
  const isMealProvider = await MealProvider.findOne({ user: userId }).select(
    "user"
  );
  if (!isMealProvider) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found");
  }
  const isKitchenExists = await Kitchen.findOne({
    owner: isMealProvider?._id,
  }).select("owner");
  if (!isKitchenExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found");
  }
  if (
    isMealExists?.kitchen?.toString() !== isKitchenExists?._id.toString() ||
    isMealExists?.owner.toString() !== isMealProvider._id.toString()
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "you can`t visit this meal profile"
    );
  }
  const result = await Meal.findById(id).select(
    "-isDeleted -kitchen -owner -updatedAt"
  );
  return result;
};

const getASingleMeal = async (id: string) => {
  const isMealExists = await Meal.findById(id).populate({
    path: "kitchen",
    select: "kitchenName",
  });
  if (!isMealExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found");
  }
  if (isMealExists?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found");
  }
  return isMealExists;
};

const getAMealsProfile = async (id: string) => {
  const result = await Meal.findById(id)
    .populate({ path: "kitchen", select: "kitchenName" })
    .populate({ path: "owner", select: "name" });
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "mealInfo not found");
  }
  if (result?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "mealInfo not found");
  }
  return result;
};

const getSixMeals = async () => {
  const result = await Meal.find()
    .sort({ createdAt: -1 })
    .limit(6)
    .select("title cuisineType price imageUrl foodPreference foodCategory");
  return result;
};

const getFoodCategory = async () => {
  const result = await Meal.distinct("foodCategory").sort();
  return result;
};

const getFoodPreference = async () => {
  const result = await Meal.distinct("foodPreference").sort();
  return result;
};

const getCuisineType = async () => {
  const result = await Meal.distinct("cuisineType").sort();
  return result;
};

const updateMeal = async ({
  payload,
  id,
  userId,
}: {
  payload: Partial<TExtendedMeals>;
  id: string;
  userId: string;
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
  const isMealExists = await Meal.findById(id);
  if (!isMealExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found");
  }
  const isMealProvider = await MealProvider.findOne({ user: userId }).select(
    "user"
  );
  if (!isMealProvider) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found");
  }
  const isKitchenExists = await Kitchen.findOne({
    owner: isMealProvider?._id,
  }).select("owner");
  if (!isKitchenExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found");
  }
  if (
    isMealExists?.kitchen?.toString() !== isKitchenExists?._id.toString() ||
    isMealExists?.owner.toString() !== isMealProvider._id.toString()
  ) {
    throw new AppError(StatusCodes.BAD_REQUEST, "you can`t update this meal");
  }
  const {
    addDietaryPreferences,
    removeDietaryPreferences,
    addIngredients,
    removeIngredients,
    addAllergies,
    removeAllergies,
    addAvailableDays,
    removeAvailableDays,
    addAvailableTime,
    removeAvailableTime,
    ...rmainingInfo
  } = payload;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // update basic data
    const updatedBasicData = await Meal.findByIdAndUpdate(id, rmainingInfo, {
      session,
      new: true,
      runValidators: true,
    });
    if (!updatedBasicData) {
      throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
    }
    // update primitive data starts
    // diatery preference
    if (removeDietaryPreferences && removeDietaryPreferences.length > 0) {
      const updated = await Meal.findByIdAndUpdate(
        id,
        { $pull: { dietaryPreferences: { $in: removeDietaryPreferences } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    if (addDietaryPreferences && addDietaryPreferences.length > 0) {
      const updated = await Meal.findByIdAndUpdate(
        id,
        { $addToSet: { dietaryPreferences: { $each: addDietaryPreferences } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    // ingredients
    if (removeIngredients && removeIngredients.length > 0) {
      const currentIngredients = isMealExists?.ingredients;
      const allExists = removeIngredients.every((item) =>
        currentIngredients.includes(item)
      );
      if (!allExists) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          "the ingredients you tried to remove is not availavle in the meal"
        );
      }
      const updated = await Meal.findByIdAndUpdate(
        id,
        { $pull: { ingredients: { $in: removeIngredients } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    if (addIngredients && addIngredients.length > 0) {
      const updated = await Meal.findByIdAndUpdate(
        id,
        { $addToSet: { ingredients: { $each: addIngredients } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    // allergies
    if (removeAllergies && removeAllergies.length > 0) {
      const updated = await Meal.findByIdAndUpdate(
        id,
        { $pull: { allergies: { $in: removeAllergies } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    if (addAllergies && addAllergies.length > 0) {
      const updated = await Meal.findByIdAndUpdate(
        id,
        { $addToSet: { allergies: { $each: addAllergies } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    // available days
    if (removeAvailableDays && removeAvailableDays.length > 0) {
      const updated = await Meal.findByIdAndUpdate(
        id,
        { $pull: { availableDays: { $in: removeAvailableDays } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    if (addAvailableDays && addAvailableDays.length > 0) {
      const updated = await Meal.findByIdAndUpdate(
        id,
        { $addToSet: { availableDays: { $each: addAvailableDays } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    // available time
    if (removeAvailableTime && removeAvailableTime.length > 0) {
      const updated = await Meal.findByIdAndUpdate(
        id,
        { $pull: { availableTime: { $in: removeAvailableTime } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    if (addAvailableTime && addAvailableTime.length > 0) {
      const updated = await Meal.findByIdAndUpdate(
        id,
        { $addToSet: { availableTime: { $each: addAvailableTime } } },
        { session, new: true, runValidators: true }
      );
      if (!updated) {
        throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
      }
    }
    // updated primitive data ends

    await session.commitTransaction();
    await session.endSession();
    const updatedData = await Meal.findById(id).populate("kitchen owner");
    return updatedData;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

const deleteMeal = async (id: string, user: JwtPayload) => {
  const { userRole, userId } = user;
  const isMealExists = await Meal.findById(id).select("isDeleted owner");
  if (!isMealExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "this meal doesn`t exists");
  }
  if (isMealExists?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "this meal doesn`t exists");
  }
  if (userRole === USER_ROLE.mealProvider) {
    const providerID = await MealProvider.findOne({ user: userId }).select(
      "user"
    );
    if (!providerID) {
      throw new AppError(StatusCodes.NOT_FOUND, "failed to delete this meal");
    }
    if (isMealExists.owner.toString() !== providerID._id.toString()) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "you are not authorized to delete this meal"
      );
    }
  }
  const result = await Meal.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to delete data");
  }
  return null;
};

export const mealService = {
  createMeal,
  getAllMeals,
  getASingleMeal,
  updateMeal,
  getMyMeals,
  getSixMeals,
  getFoodCategory,
  getFoodPreference,
  getCuisineType,
  getAllMealList,
  deleteMeal,
  getAMealsProfile,
  getMyMealDetails,
};

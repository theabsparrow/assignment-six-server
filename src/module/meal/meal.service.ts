import { JwtPayload } from "jsonwebtoken";
import { TMeal } from "./meal.interface";
import { MealProvider } from "../mealProvider/mealProvider.model";
import AppError from "../../error/AppError";
import { StatusCodes } from "http-status-codes";
import { Kitchen } from "../kitchen/kitchen.model";
import { Meal } from "./meal.model";
import QueryBuilder from "../../builder/QueryBuilder";

const createMeal = async (user: JwtPayload, payload: TMeal) => {
  const { userId } = user;
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
  const getAllMealsQuery = new QueryBuilder(
    Meal.find().populate("kitchen owner"),
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

const getASingleMeal = async (id: string) => {
  const isMealExists = await Meal.findById(id).populate("kitchen owner");
  if (!isMealExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found");
  }
  return isMealExists;
};

export const mealService = {
  createMeal,
  getAllMeals,
  getASingleMeal,
};

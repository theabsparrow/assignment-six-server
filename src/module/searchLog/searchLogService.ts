import { StatusCodes } from "http-status-codes";
import AppError from "../../error/AppError";
import { SearchLog } from "./searchLog.model";
import { Meal } from "../meal/meal.model";
import { TsearchedMeals } from "../meal/meal.interface";

const searchLogCreation = async (query: string) => {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) return;

  await SearchLog.findOneAndUpdate(
    { query: normalizedQuery },
    { $inc: { count: 1 } },
    { upsert: true, new: true }
  );
};

const getTopSearchQuery = async () => {
  const mostSearchedKeyword = await SearchLog.find()
    .sort({ count: -1 })
    .limit(10)
    .lean();
  if (mostSearchedKeyword.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, "no keyword searched yet");
  }
  const keywords = mostSearchedKeyword.map((item) => item.query);
  const meals: TsearchedMeals[] = [];
  for (const keyword of keywords) {
    const meal = await Meal.findOne({
      title: new RegExp(`\\b${keyword}\\b`, "i"),
      isDeleted: false,
    });
    if (meal) {
      const alreadyAdded = meals.some(
        (m) =>
          m._id.equals(meal._id) ||
          m.title.toLowerCase() === meal.title.toLowerCase()
      );
      if (!alreadyAdded) {
        meals.push(meal);
      }
    }

    if (meals.length === 4) break;
  }
  if (meals.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data available right now");
  }

  return meals;
};

export const searchLogService = {
  searchLogCreation,
  getTopSearchQuery,
};

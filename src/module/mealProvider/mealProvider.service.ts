import { StatusCodes } from "http-status-codes";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import { searchableFields } from "../customer/customer.const";
import { USER_ROLE } from "../user/user.const";
import { MealProvider } from "./mealProvider.model";
import { TMealProvider } from "./mealProvider.interface";
import { calculateAge, capitalizeFirstWord } from "../user/user.utills";

const getAllMealProvider = async (
  role: string,
  query: Record<string, unknown>
) => {
  const filter: Record<string, unknown> = {};
  if (role === USER_ROLE.admin) {
    filter.isDeleted = false;
  }
  query = { ...query, ...filter };
  const usersQuery = new QueryBuilder(
    MealProvider.find().populate("user"),
    query
  )
    .search(searchableFields)
    .filter()
    .sort()
    .paginateQuery()
    .fields();
  const result = await usersQuery.modelQuery;
  const meta = await usersQuery.countTotal();
  return { meta, result };
};

const getASingleMealProvider = async (id: string) => {
  const result = await MealProvider.findById(id).populate("user");
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "faild to retrive info");
  }
  return result;
};

const updateInfo = async (payload: Partial<TMealProvider>, id: string) => {
  const isExist = await MealProvider.findOne({ user: id });
  if (!isExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "faild to retrive info");
  }
  if (payload?.dateOfBirth) {
    const age = calculateAge(payload.dateOfBirth);
    if (age < 18) {
      throw new AppError(
        StatusCodes.CONFLICT,
        "You must be at least 18 years old."
      );
    }
  }
  if (payload?.name) {
    payload.name = capitalizeFirstWord(payload.name);
  }
  const updatedData = await MealProvider.findOneAndUpdate(
    { user: id },
    payload,
    { new: true }
  );
  if (!updatedData) {
    throw new AppError(StatusCodes.NOT_FOUND, "faild to update data");
  }
  return updatedData;
};

export const mealProviderService = {
  getAllMealProvider,
  getASingleMealProvider,
  updateInfo,
};

import { StatusCodes } from "http-status-codes";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import { searchableFields } from "../customer/customer.const";
import { USER_ROLE } from "../user/user.const";
import { MealProvider } from "./mealProvider.model";

const getAllMealProvider = async (
  role: string,
  query: Record<string, unknown>
) => {
  const filter: Record<string, unknown> = {};
  if (role === USER_ROLE.admin) {
    filter.isDeleted = false;
    filter.role = USER_ROLE["meal provider"];
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

export const mealProviderService = {
  getAllMealProvider,
  getASingleMealProvider,
};

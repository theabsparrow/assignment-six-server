import { StatusCodes } from "http-status-codes";
import AppError from "../../error/AppError";
import { Customer } from "../customer/customer.model";
import { TMealPlanner } from "./mealPlanner.interface";
import { MealPlanner } from "./mealPlanner.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { JwtPayload } from "jsonwebtoken";

const createMealPlan = async (payload: TMealPlanner, userId: string) => {
  const customerId = await Customer.findOne({ user: userId }).select("email");
  if (!customerId) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to create planner");
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
  if (isCustomerExist?._id.toString() !== result?.customer.toString()) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "you are not permitted to view this plan"
    );
  }
  return result;
};

// if (removeFoodPreference && removeFoodPreference.length > 0) {
//     const updated = await Customer.findOneAndUpdate(
//       { user: id },
//       { $pull: { foodPreference: removeFoodPreference } },
//       { session, new: true, runValidators: true }
//     );
//     if (!updated) {
//       throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
//     }
//   }

//   if (addFoodPreference && addFoodPreference.length > 0) {
//     const updated = await Customer.findOneAndUpdate(
//       { user: id },
//       { $addToSet: { foodPreference: { $each: addFoodPreference } } },
//       { session, new: true, runValidators: true }
//     );
//     if (!updated) {
//       throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
//     }
//   }

export const mealPlannerService = {
  createMealPlan,
  getMyMealPlans,
  getASingleMyPlan,
};

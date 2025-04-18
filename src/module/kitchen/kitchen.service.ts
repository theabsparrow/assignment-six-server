import { StatusCodes } from "http-status-codes";
import AppError from "../../error/AppError";
import { TKitchen } from "./kitchen.interface";
import { Kitchen } from "./kitchen.model";
import { MealProvider } from "../mealProvider/mealProvider.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { JwtPayload } from "jsonwebtoken";
import { USER_ROLE } from "../user/user.const";

const createKitchen = async (id: string, payload: TKitchen) => {
  const isMealProvider = await MealProvider.findOne({ user: id });
  if (!isMealProvider) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to create a kitchen");
  }
  const isKitchenExist = await Kitchen.findOne({ owner: id });
  if (isKitchenExist) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "you have already a kitchen, so you can`t create another"
    );
  }
  const kitchenEmail = payload?.email || isMealProvider?.email;
  const isEmailExist = await Kitchen.findOne({ email: kitchenEmail });
  if (isEmailExist) {
    throw new AppError(StatusCodes.CONFLICT, "this email is already exists");
  }
  const modifiedData = {
    ...payload,
    email: kitchenEmail,
  };
  const isPhoneExist = await Kitchen.findOne({
    phoneNumber: payload?.phoneNumber,
  });
  if (isPhoneExist) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "this phone number is already exists"
    );
  }
  if (payload?.kitchenType === "Commercial" && !payload.licenseOrCertificate) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "commercial kitchen must have a license or certificate"
    );
  }
  payload.owner = isMealProvider?._id;
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

export const kitchenService = {
  createKitchen,
  getAllKitchen,
  getASingleKitchen,
};

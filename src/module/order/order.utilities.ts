import { Kitchen } from "../kitchen/kitchen.model";
import AppError from "../../error/AppError";
import { StatusCodes } from "http-status-codes";
import { MealProvider } from "../mealProvider/mealProvider.model";
import { User } from "../user/user.model";
import { Order } from "./order.model";
import { Customer } from "../customer/customer.model";

export const isKitchen = async (id: string) => {
  const isKitchenExists = await Kitchen.findById(id).select(
    "isDeleted isActive email kitchenName"
  );
  if (!isKitchen) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "the kitchen of the meal is unavailable"
    );
  }
  if (isKitchenExists?.isDeleted) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "the kitchen of the meal is unavailable"
    );
  }
  if (!isKitchenExists?.isActive) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "the kitchen of the meal is not active right now"
    );
  }
  return isKitchenExists;
};

export const providerEmail = async (id: string) => {
  const isMeaLProvider = await MealProvider.findById(id).select("user");
  if (!isMeaLProvider) {
    throw new AppError(StatusCodes.NOT_FOUND, "meal provider data not found");
  }
  const isProviderExists = await User.findById(isMeaLProvider?.user).select(
    "email"
  );
  if (!isProviderExists) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "this user doesn`t exist");
  }
  const deleted = isProviderExists?.isDeleted;
  if (deleted) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "this user doesn`t exist");
  }
  const status = isProviderExists?.status;
  if (status === "blocked") {
    throw new AppError(StatusCodes.UNAUTHORIZED, "this user doesn`t exist");
  }
  return isProviderExists;
};

export const isOrder = async (id: string) => {
  const isOrderExists = await Order.findById(id);
  if (!isOrderExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "order data not found");
  }
  if (isOrderExists?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "order data not found");
  }
  if (!isOrderExists?.isActive) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "this order is already deactivate"
    );
  }
  if (
    isOrderExists?.status === "Cancelled" ||
    isOrderExists?.status === "Delivered"
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `order status is already ${isOrderExists?.status}. you can't change it`
    );
  }
  return isOrderExists;
};

export const isCustomerExists = async (id: string) => {
  const isCustomerExists = await Customer.findById(id).select("name user");
  if (!isCustomerExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "customer data not found");
  }
  const isCustomer = await User.findById(isCustomerExists?.user).select(
    "email"
  );
  if (!isCustomer) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "this user doesn`t exist");
  }
  const deleted = isCustomer?.isDeleted;
  if (deleted) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "this user doesn`t exist");
  }
  const status = isCustomer?.status;
  if (status === "blocked") {
    throw new AppError(StatusCodes.UNAUTHORIZED, "this user doesn`t exist");
  }
  return {
    name: isCustomerExists?.name,
    email: isCustomer?.email,
    id: isCustomerExists?._id,
  };
};

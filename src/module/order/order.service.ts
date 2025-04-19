/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../error/AppError";
import { Meal } from "../meal/meal.model";
import { TOrder, TOrderStatus } from "./order.interface";
import { Kitchen } from "../kitchen/kitchen.model";
import { Customer } from "../customer/customer.model";
import { Order } from "./order.model";
import { USER_ROLE } from "../user/user.const";
import mongoose from "mongoose";
import { JwtPayload } from "jsonwebtoken";
import { MealProvider } from "../mealProvider/mealProvider.model";

const createOrder = async ({
  id,
  userId,
  payload,
}: {
  id: string;
  userId: string;
  payload: TOrder;
}) => {
  const isMealExist = await Meal.findById(id).select("kitchen");
  if (!isMealExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "this meal data not found");
  }
  const isKitchen = await Kitchen.findById(isMealExist?.kitchen).select(
    "isDeleted isActive"
  );
  if (!isKitchen) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "the kitchen of the meal is unavailable"
    );
  }
  if (isKitchen?.isDeleted) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "the kitchen of the meal is unavailable"
    );
  }
  if (!isKitchen?.isActive) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "the kitchen of the meal is not active right now"
    );
  }
  const isCustomerExist = await Customer.findOne({ user: userId }).select(
    "email"
  );
  if (!isCustomerExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "customer data not found");
  }
  payload.customerId = isCustomerExist?._id;
  payload.kitchenId = isKitchen?._id;
  payload.mealId = isMealExist?._id;
  payload.totalPrice = Number((payload.price * payload.quantity).toFixed(2));
  if (payload?.mealPlanner) {
    payload.deliveryMode = "Meal planner";
  }
  const result = await Order.create(payload);
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to place the order");
  }
  const orderInfo = await Order.findById(result?._id).populate(
    "customerId kitchenId mealId mealPlanner"
  );
  return orderInfo;
};

const changeOrderStatus = async ({
  user,
  id,
  status,
}: {
  user: JwtPayload;
  id: string;
  status: TOrderStatus;
}) => {
  const { userRole, userId } = user;
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

  if (
    userRole === USER_ROLE.customer &&
    (status === "Confirmed" || status === "Delivered")
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `you can't change the status to ${status}`
    );
  }

  if (userRole === USER_ROLE.customer) {
    const isCustomerExist = await Customer.findOne({ user: userId }).select(
      "email"
    );
    if (!isCustomerExist) {
      throw new AppError(StatusCodes.NOT_FOUND, "customer data not found");
    }
    if (
      isOrderExists?.customerId.toString() !== isCustomerExist?._id.toString()
    ) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "you can`t cancell this order"
      );
    }
  }

  if (userRole === USER_ROLE["meal provider"]) {
    const isMealProviderExist = await MealProvider.findOne({
      user: userId,
    }).select("email");
    if (!isMealProviderExist) {
      throw new AppError(StatusCodes.NOT_FOUND, "customer data not found");
    }
    const isKitchenExists = await Kitchen.findOne({
      owner: isMealProviderExist?._id,
    }).select("owner");
    if (!isKitchenExists) {
      throw new AppError(StatusCodes.NOT_FOUND, "kitchen data not found");
    }
    if (
      isOrderExists?.kitchenId.toString() !== isKitchenExists?._id.toString()
    ) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "you can`t change the status of this order"
      );
    }
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    if (status === "Cancelled") {
      const result = await Order.findByIdAndUpdate(
        id,
        { status: status, isActive: false },
        { session, new: true, runValidators: true }
      );
      if (!result) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `faild to ${status} the order`
        );
      }
    } else {
      const result = await Order.findByIdAndUpdate(
        id,
        { status: status },
        { session, new: true, runValidators: true }
      );
      if (!result) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `faild to ${status} the order`
        );
      }
    }
    await session.commitTransaction();
    await session.endSession();
    const result = await Order.findById(isOrderExists?._id);
    return result;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

const updateDeliveryCount = async (id: string, user: JwtPayload) => {
  const { userId, userRole } = user;
  const isOrderExists = await Order.findById(id).select(
    "isDeleted isActive status deliveredCount orderType kitchenId"
  );
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
  if (isOrderExists?.status !== "Confirmed") {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "you need to accept the order to update the order count"
    );
  }

  if (userRole === USER_ROLE["meal provider"]) {
    const isMealProviderExist = await MealProvider.findOne({
      user: userId,
    }).select("email");
    if (!isMealProviderExist) {
      throw new AppError(StatusCodes.NOT_FOUND, "customer data not found");
    }
    const isKitchenExists = await Kitchen.findOne({
      owner: isMealProviderExist?._id,
    }).select("owner");
    if (!isKitchenExists) {
      throw new AppError(StatusCodes.NOT_FOUND, "kitchen data not found");
    }
    if (
      isOrderExists?.kitchenId.toString() !== isKitchenExists?._id.toString()
    ) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "you can`t change the status of this order"
      );
    }
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const deliveredCount = (isOrderExists?.deliveredCount as number) + 1;
    if (isOrderExists?.orderType === "once") {
      const payload = {
        deliveredCount: deliveredCount,
        isActive: false,
        status: "Delivered",
      };
      const result = await Order.findByIdAndUpdate(
        isOrderExists?._id,
        payload,
        { session, new: true, runValidators: true }
      );
      if (!result) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `faild to update order count`
        );
      }
    } else {
      const result = await Order.findByIdAndUpdate(
        isOrderExists?._id,
        { deliveredCount: deliveredCount },
        { session, new: true, runValidators: true }
      );
      if (!result) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `faild to update order count`
        );
      }
    }
    await session.commitTransaction();
    await session.endSession();
    const result = await Order.findById(isOrderExists?._id);
    return result;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.BAD_REQUEST, err);
  }
};

export const orderService = {
  createOrder,
  changeOrderStatus,
  updateDeliveryCount,
};

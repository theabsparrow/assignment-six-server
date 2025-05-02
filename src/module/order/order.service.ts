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
import config from "../../config";
import { orderEmailTemplate } from "../../utills/orderEmailTemplate";
import { sendEmail } from "../../utills/sendEmail";
import { TemailOrder, TemailOrderStatus } from "../../interface/global";
import { changeStatusEmailTemplate } from "../../utills/changeStatusEmail";
import QueryBuilder from "../../builder/QueryBuilder";
import { User } from "../user/user.model";

const createOrder = async ({
  id,
  userId,
  payload,
}: {
  id: string;
  userId: string;
  payload: TOrder;
}) => {
  const isMealExist = await Meal.findById(id).select(
    "kitchen isAvailable title"
  );
  if (!isMealExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "this meal data not found");
  }
  if (!isMealExist?.isAvailable) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "this meal is not available right now"
    );
  }
  const isKitchen = await Kitchen.findById(isMealExist?.kitchen).select(
    "isDeleted isActive email kitchenName"
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

  const isUserExists = await User.findById(userId);
  if (!isUserExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "customer data not found");
  }

  const isCustomerExist = await Customer.findOne({ user: userId }).select(
    "name"
  );
  if (!isCustomerExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "customer data not found");
  }
  payload.customerId = isCustomerExist?._id;
  payload.kitchenId = isKitchen?._id;
  payload.mealId = isMealExist?._id;
  payload.totalPrice = Number((payload.price * payload.quantity).toFixed(2));
  if (payload?.mealPlanner) {
    payload.deliveryMode = "mealPlanner";
  }
  const result = await Order.create(payload);
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to place the order");
  }
  const orderInfo = await Order.findById(result?._id).populate(
    "customerId kitchenId mealId mealPlanner"
  );

  if (result && orderInfo) {
    const info: TemailOrder = {
      customerName: isCustomerExist?.name,
      customerEmail: isUserExists?.email,
      orderDate: orderInfo?.startDate,
      kitchenName: isKitchen?.kitchenName,
      mealName: isMealExist?.title,
      totalAmount: orderInfo?.totalPrice,
    };
    const link = `${config.client_certain_route}/mealProvider/${result?._id}`;
    const html = orderEmailTemplate(link, info);
    await sendEmail({
      to: isKitchen?.email,
      html,
      subject: `${isMealExist?.title} order is placed`,
      text: "check this order to know more about this",
    });
    return orderInfo;
  }
};

const getMyOrder = async (id: string, query: Record<string, unknown>) => {
  const isCustomerExists = await Customer.findOne({ user: id }).select("user");
  if (!isCustomerExists) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to retrive data");
  }
  const filter: Record<string, unknown> = {};
  filter.isDeleted = false;
  filter.customerId = isCustomerExists?._id;
  query = { ...query, ...filter };
  const orderQuery = new QueryBuilder(Order.find(), query)
    .filter()
    .sort()
    .paginateQuery()
    .fields();
  const result = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found");
  }
  return { meta, result };
};

const getMealProviderOrder = async (
  id: string,
  query: Record<string, unknown>
) => {
  const isMealProviderExists = await MealProvider.findOne({ user: id }).select(
    "user"
  );
  if (!isMealProviderExists) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to retrive data");
  }
  const isKitchenExists = await Kitchen.findOne({
    owner: isMealProviderExists?._id,
  }).select("email");
  if (!isKitchenExists) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to retrive data");
  }
  const filter: Record<string, unknown> = {};
  filter.isDeleted = false;
  filter.kitchenId = isKitchenExists?._id;
  query = { ...query, ...filter };
  const orderQuery = new QueryBuilder(Order.find(), query)
    .filter()
    .sort()
    .paginateQuery()
    .fields();
  const result = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "no data found");
  }
  return { meta, result };
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
  const info: Partial<TemailOrderStatus> = {};

  const isUserExists = await User.findById(userId).select("email");
  if (!isUserExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "user data not found");
  }
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

  const mealName = await Meal.findById(isOrderExists?.mealId).select(
    "title isAvailable"
  );
  if (!mealName) {
    throw new AppError(StatusCodes.NOT_FOUND, "meal data not found");
  }
  if (!mealName?.isAvailable) {
    throw new AppError(StatusCodes.NOT_FOUND, "meal data not found");
  }

  if (userRole === USER_ROLE.customer) {
    const isCustomerExist = await Customer.findOne({ user: userId }).select(
      "name"
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
    info.customerName = isCustomerExist?.name;
    info.customerEmail = isUserExists?.email;
  }

  if (userRole === USER_ROLE.mealProvider) {
    const isMealProviderExist = await MealProvider.findOne({
      user: userId,
    }).select("user");
    if (!isMealProviderExist) {
      throw new AppError(StatusCodes.NOT_FOUND, "customer data not found");
    }
    const isKitchenExists = await Kitchen.findOne({
      owner: isMealProviderExist?._id,
    }).select("owner kitchenName");
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
    info.kitchenName = isKitchenExists?.kitchenName;
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
    if (
      userRole === USER_ROLE.admin ||
      userRole === USER_ROLE.mealProvider ||
      userRole === USER_ROLE.superAdmin
    ) {
      if (status === "Cancelled" || status === "Confirmed") {
        info.mealName = mealName?.title;
        info.orderStatus = status;
        info.orderDate = isOrderExists?.startDate;
        info.totalAmount = isOrderExists?.totalPrice;
        const link = `${config.client_certain_route}/meals}`;
        const html = changeStatusEmailTemplate(link, info as TemailOrderStatus);
        const emailRespnse = await sendEmail({
          to: info?.customerEmail as string,
          html,
          subject: `${mealName?.title} order is placed`,
          text: "check this order to know more about this",
        });
        if (!emailRespnse.accepted.length) {
          throw new AppError(
            StatusCodes.BAD_REQUEST,
            `faild to send email to the customer`
          );
        }
      }
    }

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

  if (userRole === USER_ROLE.mealProvider) {
    const isMealProviderExist = await MealProvider.findOne({
      user: userId,
    }).select("user");
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
  getMyOrder,
  getMealProviderOrder,
};

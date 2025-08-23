/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../error/AppError";
import { Meal } from "../meal/meal.model";
import {
  TemailOrder,
  TemailOrderStatus,
  TgetOrder,
  TOrder,
  TOrderStatus,
} from "./order.interface";
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
import { changeStatusEmailTemplate } from "../../utills/changeStatusEmail";
import QueryBuilder from "../../builder/QueryBuilder";
import { User } from "../user/user.model";
import {
  isCustomerExists,
  mealProviderInfo,
  priorityToChange,
  userInfo,
} from "./order.utilities";

const createOrder = async ({
  id,
  userId,
  payload,
}: {
  id: string;
  userId: string;
  payload: TOrder;
}) => {
  // confirm email verified
  const isUSerExists = await User.findById(userId).select(
    "email verifiedWithEmail"
  );
  if (!isUSerExists?.verifiedWithEmail) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "you need to verify your email at first"
    );
  }
  // confirm meal existence
  const isMealExist = await Meal.findById(id).select(
    "kitchen isAvailable isDeleted title price"
  );
  if (!isMealExist || isMealExist?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "this meal data not found");
  }
  if (!isMealExist?.isAvailable) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "this meal is not available right now"
    );
  }
  // confirm customer existence
  const isCustomerExist = await Customer.findOne({ user: userId }).select(
    "name"
  );
  if (!isCustomerExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "customer data not found");
  }
  // is this order is aklready active
  const isOrdered = await Order.findOne({
    customerId: isCustomerExist?._id,
    mealId: isMealExist?._id,
  }).select("orderType status isActive");
  if (
    isOrdered &&
    isOrdered.orderType === "once" &&
    payload.orderType === "once"
  ) {
    const blockedStatuses = [
      "Pending",
      "Confirmed",
      "Cooking",
      "OutForDelivery",
      "ReadyForPickup",
    ];
    if (blockedStatuses.includes(isOrdered.status)) {
      throw new AppError(
        StatusCodes.CONFLICT,
        `You have already ordered this food and the order is now ${isOrdered.status}`
      );
    }
  }
  if (
    isOrdered &&
    isOrdered.orderType === "regular" &&
    payload.orderType === "regular" &&
    isOrdered?.isActive
  ) {
    throw new AppError(
      StatusCodes.CONFLICT,
      `You have already ordered this food as regular order and it is active right now`
    );
  }
  // confirm kitchen existence
  const isKitchenExists = await Kitchen.findById(isMealExist?.kitchen)
    .select("isActive isDeleted kitchenName owner")
    .populate({ path: "owner", select: "name" });
  if (!isKitchenExists || isKitchenExists?.isDeleted) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "the provided by the kitchen is unavailable"
    );
  }
  if (!isKitchenExists?.isActive) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "the provided by the kitchen is unavailable"
    );
  }
  // confirm provider existence
  const providerInfo = await MealProvider.findById(isKitchenExists?.owner)
    .select("user")
    .populate<{ user: { _id: string; email: string } }>({
      path: "user",
      select: "email",
    });
  if (!providerInfo) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to place order");
  }

  // insert order data
  payload.customerId = isCustomerExist?._id;
  payload.kitchenId = isKitchenExists?._id;
  payload.mealId = isMealExist?._id;
  payload.totalPrice = Number(
    (isMealExist?.price * payload.quantity).toFixed(2)
  );
  if (payload?.orderType === "regular") {
    payload.isActive = true;
    payload.deliveredCount = 0;
  }
  const result = await Order.create(payload);
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to place the order");
  }
  const orderInfo = await Order.findById(result?._id).select(
    "totalPrice, createdAt "
  );
  if (result && orderInfo) {
    const info: TemailOrder = {
      customerName: isCustomerExist?.name,
      customerEmail: isUSerExists?.email,
      orderDate: orderInfo?.createdAt
        ? new Date(orderInfo?.createdAt).toLocaleString("en-US", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : new Date().toLocaleString("en-US", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
      kitchenName: isKitchenExists?.kitchenName,
      mealName: isMealExist?.title,
      totalAmount: orderInfo?.totalPrice,
    };
    const link = `${config.client_certain_route}/mealProvider/${result?._id}`;
    const html = orderEmailTemplate(link, info);
    await sendEmail({
      to: (providerInfo.user as { _id: string; email: string }).email,
      html,
      subject: `order for ${isMealExist?.title} is placed`,
      text: "check this order to know more about this",
    });
    return orderInfo;
  }
};

const getMyOrder = async (user: JwtPayload, query: Record<string, unknown>) => {
  const { userRole, userId } = user;
  let OrderOwner: TgetOrder | null = null;
  // find customer id
  if (userRole === USER_ROLE.customer) {
    OrderOwner = await Customer.findOne({ user: userId }).select("name");
    if (!OrderOwner) {
      throw new AppError(StatusCodes.BAD_REQUEST, "faild to retrive data");
    }
  }
  // find kitchen id
  if (userRole === USER_ROLE.mealProvider) {
    const isProvider = await MealProvider.findOne({ user: userId }).select(
      "name"
    );
    if (!isProvider) {
      throw new AppError(StatusCodes.BAD_REQUEST, "faild to retrive data");
    }
    OrderOwner = await Kitchen.findOne({ owner: isProvider?._id }).select(
      "kitchenName"
    );
  }

  if (
    (userRole === USER_ROLE.customer || userRole === USER_ROLE.mealProvider) &&
    !OrderOwner
  ) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to retrive data");
  }

  // filtering system according to the role
  const filter: Record<string, unknown> = {};
  filter.isDeleted = false;
  if (query?.isActive && typeof query?.isActive === "string") {
    if (query?.isActive === "true") {
      filter.isActive = true;
    } else if (query?.isActive === "false") {
      filter.isActive = false;
    }
  }

  let populateField: { path: string; select: string }[] = [];
  if (userRole === USER_ROLE.customer) {
    filter.customerId = OrderOwner?._id;
    query.fields =
      "mealId kitchenId deliveryMode orderType status payment createdAt endDate isActive";
    populateField = [
      { path: "mealId", select: "title " },
      { path: "kitchenId", select: "kitchenName" },
    ];
  } else if (userRole === USER_ROLE.mealProvider) {
    filter.kitchenId = OrderOwner?._id;
    query.fields =
      "mealId deliveryMode orderType status payment isActive quantity totalPrice deliveredCount deliveryAddress";
    populateField = [
      { path: "mealId", select: "title " },
      { path: "customerId", select: "name" },
    ];
  } else {
    query.fields =
      "mealId kitchenId customerId deliveryMode orderType status payment createdAt isActive deliveryAddress";
    populateField = [
      { path: "mealId", select: "title " },
      { path: "customerId", select: "name" },
      { path: "kitchenId", select: "kitchenName" },
    ];
  }
  query = { ...query, ...filter };
  // get operation in the database
  const orderQuery = new QueryBuilder(
    Order.find().populate(populateField),
    query
  )
    .search(["deliveryAddress"])
    .filter()
    .sort()
    .paginateQuery()
    .fields();
  populateField.forEach((pf) => {
    orderQuery.modelQuery = orderQuery.modelQuery.populate(pf);
  });
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
  priorityToChange(userRole, status);
  const userData = await userInfo(userId);
  const isOrderExists = await Order.findById(id);
  const customerExists = await isCustomerExists(
    isOrderExists?.customerId.toString() as string
  );
  const info: Partial<TemailOrderStatus> = {};
  info.customerName = customerExists?.name;
  info.customerEmail = customerExists?.email;
  const mealName = await Meal.findById(isOrderExists?.mealId.toString());

  if (
    userRole === USER_ROLE.customer &&
    isOrderExists?.customerId.toString() !== userData?.id.toString()
  ) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "you can`t change this order status"
    );
  }

  if (userRole === USER_ROLE.mealProvider) {
    const kitchenInfo = await mealProviderInfo(userId);
    if (isOrderExists?.kitchenId.toString() !== kitchenInfo?._id.toString()) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "you can`t change the status of this order"
      );
    }
    info.kitchenName = kitchenInfo?.kitchenName;
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

    if (
      userRole === USER_ROLE.admin ||
      userRole === USER_ROLE.mealProvider ||
      userRole === USER_ROLE.superAdmin
    ) {
      if (status === "Cancelled" || status === "Confirmed") {
        info.mealName = mealName?.title;
        info.orderStatus = status;
        info.orderDate = isOrderExists?.createdAt;
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

const deleteOrder = async (id: string, user: JwtPayload) => {
  const { userId, userRole } = user;
  const isOrderExists = await Order.findById(id).select(
    "isDeleted customerId kitchenId"
  );
  const isuserVerified = await User.findById(userId).select(
    "verifiedWithEmail"
  );
  if (!isuserVerified || !isuserVerified?.verifiedWithEmail) {
    throw new AppError(StatusCodes.BAD_REQUEST, "verify your email at first");
  }
  if (!isOrderExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "this order not found");
  }
  if (userRole === USER_ROLE.customer) {
    const isCustomerExist = await Customer.findOne({
      user: isuserVerified?._id,
    }).select("name");
    if (!isCustomerExist) {
      throw new AppError(StatusCodes.BAD_REQUEST, "faild to delete the order");
    }
    if (
      isOrderExists.customerId.toString() !== isCustomerExist._id?.toString()
    ) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "you can`t delete this order"
      );
    }
  }
  if (userRole === USER_ROLE.mealProvider) {
    const isMealProviderExist = await MealProvider.findOne({
      user: isuserVerified?._id,
    }).select("name");
    if (!isMealProviderExist) {
      throw new AppError(StatusCodes.BAD_REQUEST, "faild to delete the order");
    }
    const isKitchenExists = await Kitchen.findOne({
      owner: isMealProviderExist?._id,
    }).select("kitchenName");
    if (!isKitchenExists || isKitchenExists?.isDeleted) {
      throw new AppError(StatusCodes.BAD_REQUEST, "faild to delete the order");
    }
    if (
      isOrderExists.kitchenId.toString() !== isKitchenExists._id?.toString()
    ) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "you can`t delete this order"
      );
    }
  }
  const result = await Order.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, "faild to delete the order");
  }
  return null;
};

export const orderService = {
  createOrder,
  changeOrderStatus,
  updateDeliveryCount,
  getMyOrder,
  deleteOrder,
};

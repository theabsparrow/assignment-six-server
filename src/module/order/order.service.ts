/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../error/AppError";
import { Meal } from "../meal/meal.model";
import {
  TemailOrder,
  TemailOrderStatus,
  TgetOrder,
  TOrder,
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
  convertDate,
  getEndDateOnInactive,
  priorityToChange,
} from "./order.utilities";
import { TUSerRole } from "../user/user.interface";
import { Rating } from "../rating/rating.model";

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
    payload.endDate = "";
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
      orderDate: convertDate(new Date(orderInfo?.createdAt as string)),
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

const getASingleOrder = async ({
  id,
  userRole,
  query,
}: {
  id: string;
  userRole: TUSerRole;
  query: Record<string, unknown>;
}) => {
  let populateItem: { path: string; select: string }[] = [];
  let selectitems: string = "";

  if (userRole === USER_ROLE.admin || userRole === USER_ROLE.superAdmin) {
    populateItem = [
      { path: "customerId", select: "name address gender" },
      { path: "kitchenId", select: "kitchenName" },
      {
        path: "mealId",
        select:
          "title foodCategory cuisineType foodPreference price imageUrl portionSize",
      },
    ];
    selectitems = "-updatedAt";
  }
  if (userRole === USER_ROLE.customer) {
    populateItem = [
      { path: "kitchenId", select: "kitchenName" },
      {
        path: "mealId",
        select:
          "title foodCategory cuisineType foodPreference price imageUrl portionSize",
      },
    ];
    selectitems = "-customerId";
  }
  if (userRole === USER_ROLE.mealProvider) {
    populateItem = [
      { path: "customerId", select: "name address gender" },
      {
        path: "mealId",
        select:
          "title foodCategory cuisineType foodPreference price imageUrl portionSize",
      },
    ];
    selectitems = "-kitchenId";
  }

  const isOrderExists = await Order.findById(id)
    .select(selectitems)
    .populate(populateItem);
  if (!isOrderExists || isOrderExists?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "order data not found");
  }
  let result;
  let meta;
  let isReviewExists = false;

  if (isOrderExists?.orderType === "once") {
    const isRating = await Rating.findOne({
      orderId: isOrderExists?._id,
      isDeleted: false,
    })
      .select("-mealId -updatedAt -isDeleted")
      .populate({ path: "userId", select: "name profileImage" });
    if (isRating) {
      result = isRating;
      isReviewExists = true;
    }
  }
  if (isOrderExists?.orderType === "regular") {
    if (query.deliveryNumber) {
      query.deliveryNumber = Number(query.deliveryNumber);
    }
    const filter: Record<string, unknown> = {};
    filter.isDeleted = false;
    filter.orderId = isOrderExists?._id;
    query = {
      ...query,
      fields: "-mealId, -updatedAt, -isDeleted",
      ...filter,
    };
    const ratingQuery = new QueryBuilder(Rating.find(), query)
      .filter()
      .sort()
      .paginateQuery()
      .fields();
    const reviewresult = await ratingQuery.modelQuery.populate({
      path: "userId",
      select: "name profileImage",
    });
    const metaData = await ratingQuery.countTotal();
    if (reviewresult && reviewresult.length) {
      result = reviewresult;
      meta = metaData;
      isReviewExists = true;
    }
  }
  return { isOrderExists, result, meta, isReviewExists };
};

const updateOrderStatus = async ({
  user,
  id,
  payload,
}: {
  user: JwtPayload;
  id: string;
  payload: Partial<TOrder>;
}) => {
  const { userRole: role, userId } = user;
  // check if the user verified or not
  const isUSerExists = await User.findById(userId).select("verifiedWithEmail");
  if (!isUSerExists?.verifiedWithEmail) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "you need to verify your email at first"
    );
  }
  const isOrderExists = await priorityToChange({ user, payload, id });
  // extract meal information
  const isMealExists = await Meal.findById(isOrderExists?.mealId).select(
    "title"
  );
  // extract customer information
  const isCustomerExist = await Customer.findById(
    isOrderExists?.customerId
  ).select("name user");
  const customerEmail = await User.findById(isCustomerExist?.user).select(
    "email"
  );

  // extract mealProvider information
  const isKitchen = await Kitchen.findById(isOrderExists?.kitchenId).select(
    "kitchenName owner"
  );
  const isProvider = await MealProvider.findById(isKitchen?.owner).select(
    "name user"
  );
  const isUser = await User.findById(isProvider?.user).select("email");

  // transaction roleback starts
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // update operation starts
    let result: TOrder | null = null;
    // update order activity
    if (
      isOrderExists?.orderType === "regular" &&
      payload.isActive !== undefined &&
      payload.isActive === false
    ) {
      payload.endDate = getEndDateOnInactive(isOrderExists?.deliveryDays);
      result = await Order.findByIdAndUpdate(
        id,
        { payload },
        { session, new: true, runValidators: true }
      );
      if (!result) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `faild to update the order info`
        );
      }
    }
    // update order status and increate delivery count
    if (
      isOrderExists?.orderType === "regular" &&
      payload?.status &&
      payload?.status === "Delivered"
    ) {
      result = await Order.findByIdAndUpdate(
        id,
        {
          ...payload,
          $inc: { deliveredCount: 1 },
        },
        { session, new: true, runValidators: true }
      );
      if (!result) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `faild to update the order status`
        );
      }
    } else {
      result = await Order.findByIdAndUpdate(
        id,
        { payload },
        { session, new: true, runValidators: true }
      );
      if (!result) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `faild to update the order info`
        );
      }
    }

    // email send from mealprovider end
    if (role === USER_ROLE.mealProvider && payload?.status) {
      const info: TemailOrderStatus = {
        mealName: isMealExists?.title as string,
        orderStatus: payload?.status,
        orderDate: convertDate(new Date(isOrderExists?.createdAt as string)),
        totalAmount: isOrderExists?.totalPrice as number,
        customerEmail: customerEmail?.email as string,
        customerName: isCustomerExist?.name as string,
        kitchenName: isKitchen?.kitchenName as string,
      };

      const link = `${config.client_certain_route}/meals}`;
      const html = changeStatusEmailTemplate(link, info as TemailOrderStatus);
      const emailRespnse = await sendEmail({
        to: info?.customerEmail as string,
        html,
        subject: `${isMealExists?.title} order is placed`,
        text: "check this order to know more about this",
      });
      if (!emailRespnse.accepted.length) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `faild to send email to the customer`
        );
      }
    }
    // email send from customer end
    if (
      role === USER_ROLE.customer &&
      payload?.status &&
      payload?.status == "Cancelled"
    ) {
      const info: TemailOrderStatus = {
        mealName: isMealExists?.title as string,
        orderStatus: payload?.status,
        orderDate: convertDate(new Date(isOrderExists?.createdAt as string)),
        totalAmount: isOrderExists?.totalPrice as number,
        customerEmail: isUser?.email as string,
        customerName: isProvider?.name as string,
        kitchenName: isKitchen?.kitchenName as string,
      };

      const link = `${config.client_certain_route}/meals}`;
      const html = changeStatusEmailTemplate(link, info as TemailOrderStatus);
      const emailRespnse = await sendEmail({
        to: info?.customerEmail as string,
        html,
        subject: `Information about your order ${isMealExists?.title}`,
        text: "check this order to know more about this",
      });
      if (!emailRespnse.accepted.length) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `faild to send email to the customer`
        );
      }
    }
    await session.commitTransaction();
    await session.endSession();
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
  updateOrderStatus,
  getMyOrder,
  deleteOrder,
  getASingleOrder,
};

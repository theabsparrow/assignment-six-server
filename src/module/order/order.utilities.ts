import { Kitchen } from "../kitchen/kitchen.model";
import AppError from "../../error/AppError";
import { StatusCodes } from "http-status-codes";
import { MealProvider } from "../mealProvider/mealProvider.model";
import { User } from "../user/user.model";
import { Order } from "./order.model";
import { Customer } from "../customer/customer.model";
import { USER_ROLE } from "../user/user.const";
import { Meal } from "../meal/meal.model";
import { TOrder } from "./order.interface";
import { JwtPayload } from "jsonwebtoken";
import { TCookingDay } from "../kitchen/kitchen.interface";
import { addDays, startOfWeek } from "date-fns";
import { dayMap } from "./order.const";

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

export const priorityToChange = async ({
  user,
  payload,
  id,
}: {
  user: JwtPayload;
  payload: Partial<TOrder>;
  id: string;
}) => {
  const { userRole: role, userId } = user;

  // check role based status validation
  if (
    (role === USER_ROLE.customer ||
      role === USER_ROLE.admin ||
      role === USER_ROLE.superAdmin) &&
    (payload?.status === "Confirmed" ||
      payload?.status === "Delivered" ||
      payload?.status === "Cooking" ||
      payload?.status === "ReadyForPickup" ||
      payload?.status === "OutForDelivery" ||
      payload?.status === "Pending")
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `you can't change the status to ${payload?.status}`
    );
  }

  // check if the note only can be changed by the customer
  if (
    (role === USER_ROLE.mealProvider ||
      role === USER_ROLE.admin ||
      role === USER_ROLE.superAdmin) &&
    payload?.note
  ) {
    throw new AppError(StatusCodes.BAD_REQUEST, `you can't update the note`);
  }

  // check order existance
  const isOrderExists = await Order.findById(id).select(
    "kitchenId customerId mealId status isActive orderType isDeleted deliveredCount deliveryDays "
  );
  if (!isOrderExists || isOrderExists?.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, `this order doesn't exists`);
  }

  // check if the customer is authoruized
  if (role === USER_ROLE.customer) {
    const isCustomerExist = await Customer.findOne({ user: userId }).select(
      "name"
    );
    if (!isCustomerExist) {
      throw new AppError(StatusCodes.UNAUTHORIZED, `you are not authorized`);
    }
    if (
      isCustomerExist._id.toString() !== isOrderExists.customerId.toString()
    ) {
      throw new AppError(StatusCodes.UNAUTHORIZED, `you are not authorized`);
    }
  }

  // check if the mealprovider is authorized
  if (role === USER_ROLE.mealProvider) {
    const isMeaLProvider = await MealProvider.findOne({ user: userId }).select(
      "name"
    );
    if (!isMeaLProvider) {
      throw new AppError(StatusCodes.UNAUTHORIZED, `you are not authorized`);
    }
    const isKitchenExists = await Kitchen.findOne({
      owner: isMeaLProvider?._id,
    }).select("kitchenName isDeleted");
    if (!isKitchenExists || isKitchenExists?.isDeleted) {
      throw new AppError(StatusCodes.UNAUTHORIZED, `you are not authorized`);
    }
    if (isKitchenExists._id.toString() !== isOrderExists.kitchenId.toString()) {
      throw new AppError(StatusCodes.UNAUTHORIZED, `you are not authorized`);
    }
  }

  const status = isOrderExists?.status;
  // check the same status is not coming to update
  if (status === payload?.status) {
    throw new AppError(
      StatusCodes.CONFLICT,
      `the status is already ${isOrderExists?.status}`
    );
  }
  // check if the status is already cancelled
  if (status === "Cancelled") {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      `this order is already cancelled`
    );
  }

  // check if the order can`t be cancel in a certain stage
  if (
    role === USER_ROLE.admin ||
    role === USER_ROLE.mealProvider ||
    role === USER_ROLE.customer
  ) {
    if (
      (status === "Cooking" ||
        status == "ReadyForPickup" ||
        status === "OutForDelivery" ||
        status === "Delivered") &&
      payload?.status === "Cancelled"
    ) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `you can't cancell the order as it is already ${status} now`
      );
    }
  }

  // check if the order is active or not
  if (
    isOrderExists?.orderType === "regular" &&
    payload?.isActive !== undefined &&
    payload?.isActive === true
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `This order can't be activate right now as it is already inactive`
    );
  }

  // check if the same activity status is coming
  if (payload?.isActive !== undefined) {
    if (isOrderExists?.isActive === payload?.isActive) {
      throw new AppError(
        StatusCodes.CONFLICT,
        `the order is already ${
          isOrderExists?.isActive ? "Active" : "inActive"
        }`
      );
    }
  }

  // check if the regular type order is inactive then can`t change the status
  if (
    isOrderExists?.orderType === "regular" &&
    isOrderExists?.isActive === false &&
    isOrderExists?.status === "Delivered" &&
    payload?.status
  ) {
    throw new AppError(StatusCodes.CONFLICT, `The order is inActive. `);
  }
  return isOrderExists;
};

export const mealInfo = async (id: string) => {
  const mealName = await Meal.findById(id).select("title isAvailable");
  if (!mealName) {
    throw new AppError(StatusCodes.NOT_FOUND, "meal data not found");
  }
  if (!mealName?.isAvailable) {
    throw new AppError(StatusCodes.NOT_FOUND, "meal data not found");
  }
  return mealName;
};

export const userInfo = async (id: string) => {
  const isUserExists = await User.findById(id).select(
    "email verifiedWithEmail"
  );
  if (!isUserExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "user data not found");
  }
  if (!isUserExists?.verifiedWithEmail) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "you need to verify your email at first"
    );
  }
  const isCustomerExist = await Customer.findOne({ user: id }).select("name");
  if (!isCustomerExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "customer data not found");
  }
  return {
    email: isUserExists?.email,
    name: isCustomerExist?.name,
    id: isCustomerExist?._id,
  };
};

export const mealProviderInfo = async (id: string) => {
  const isMealProviderExist = await MealProvider.findOne({
    user: id,
  }).select("user");
  if (!isMealProviderExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "meal provider data not found");
  }
  const isKitchenExists = await Kitchen.findOne({
    owner: isMealProviderExist?._id,
  }).select("owner kitchenName");
  if (!isKitchenExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "kitchen data not found");
  }
  return isKitchenExists;
};

export const convertDate = (date: Date) => {
  const convertDate = new Date(date);
  const creationDate = convertDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const creationTime = convertDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const dateTime = `${creationTime} ${creationDate}`;
  return dateTime;
};

const getEndDate = (baseDate: Date, deliveryDays: TCookingDay[]) => {
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 });
  return deliveryDays
    .map((day) => addDays(weekStart, dayMap[day]))
    .sort((a, b) => a.getTime() - b.getTime());
};

export const getEndDateOnInactive = (deliveryDays: TCookingDay[]): string => {
  const inactiveDate = new Date();
  const deliveriesThisWeek = getEndDate(inactiveDate, deliveryDays);
  const lastDelivery = deliveriesThisWeek[deliveriesThisWeek.length - 1];
  const convertDate = lastDelivery.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return convertDate;
};

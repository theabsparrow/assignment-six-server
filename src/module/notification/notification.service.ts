import { StatusCodes } from "http-status-codes";
import QueryBuilder from "../../builder/QueryBuilder";
import { KitchenSubscriber } from "../kitchenSubscriber/kitchenSubscriber.model";
import { Notification } from "./notification.model";
import AppError from "../../error/AppError";
import {
  TCancelNotification,
  TChangeOrderStatusNotification,
  TKitchenSubscriberNotification,
  TOrderCreationNotification,
} from "./notification.interface";
import { io } from "../../app";

const notifyKitchenSubscribers = async ({
  kitchenId,
  kitchenName,
  mealId,
}: TKitchenSubscriberNotification) => {
  const subs = await KitchenSubscriber.find({ kitchen: kitchenId }).select(
    "user -_id"
  );
  if (!subs || subs.length === 0) return;

  const notifications = subs.map((s) => ({
    userId: s.user,
    mealId: mealId,
    content: `${kitchenName} has published a new meal item`,
    link: `/meals/${mealId}`,
  }));
  const created = await Notification.insertMany(notifications);
  created.forEach((n) => {
    io.to(n?.userId.toString()).emit("notification", {
      _id: n?._id,
      content: n?.content,
      link: n?.link,
      isRead: n?.isRead,
      createdAt: n?.createdAt,
    });
  });
};

const createOrderNotification = async ({
  mealName,
  orderId,
  userId,
  customerName,
}: TOrderCreationNotification) => {
  const notification = {
    userId,
    orderId,
    content: `${customerName} has requested a new order for ${mealName}`,
    link: `/mealProvider/myOrders/${orderId}`,
  };
  const created = await Notification.create(notification);
  io.to(created.userId.toString()).emit("notification", {
    _id: created?._id,
    content: created?.content,
    link: created?.link,
    isRead: created?.isRead,
    createdAt: created?.createdAt,
  });
};

const notifyCustomerForOrderStatus = async ({
  mealName,
  orderId,
  userId,
  status,
}: TChangeOrderStatusNotification) => {
  const notification = {
    userId,
    orderId,
    content: `your order for ${mealName} is ${status}`,
    link: `/user/myOrders/${orderId}`,
  };
  const created = await Notification.create(notification);
  io.to(created.userId.toString()).emit("notification", {
    _id: created?._id,
    content: created?.content,
    link: created?.link,
    isRead: created?.isRead,
    createdAt: created?.createdAt,
  });
};

const notifyProviderForOrderCancelation = async ({
  mealName,
  orderId,
  userId,
  status,
  customerName,
}: TCancelNotification) => {
  const notification = {
    userId,
    orderId,
    content: `${customerName} has ${status} the order for ${mealName}`,
    link: `/mealProvider/myOrders/${orderId}`,
  };
  const created = await Notification.create(notification);
  io.to(created.userId.toString()).emit("notification", {
    _id: created?._id,
    content: created?.content,
    link: created?.link,
    isRead: created?.isRead,
    createdAt: created?.createdAt,
  });
};

const getMyNotification = async (id: string) => {
  const query = {
    userId: id,
    isDeleted: false,
    fields: "mealId, orderId, content, link, isRead, createdAt, ",
    limit: 5,
  };
  const myNotificationQuery = new QueryBuilder(Notification.find(), query)
    .filter()
    .sort()
    .paginateQuery()
    .fields();
  const result = await myNotificationQuery.modelQuery;
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "no notification found");
  }
  return result;
};

const updateNotification = async (id: string, userId: string) => {
  const notification = await Notification.findById(id).select(
    "isDeleted isRead userId"
  );
  if (!notification || notification?.isDeleted) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "this notification does not exist"
    );
  }
  if (notification.userId.toString() !== userId) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "you can`t view this notification"
    );
  }
  const result = await Notification.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true }
  );
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, "something went wrong");
  }
  return result;
};

const deleteNotification = async (id: string, userId: string) => {
  const isNotificationExists = await Notification.findById(id).select(
    "isDeleted userId"
  );
  if (!isNotificationExists || isNotificationExists.isDeleted) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "this notification does not exists"
    );
  }

  if (userId !== isNotificationExists.userId.toString()) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "you can`t delete this notification"
    );
  }
  const result = await Notification.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!result) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "faild to delete this notification"
    );
  }
  return null;
};
export const notificationService = {
  notifyKitchenSubscribers,
  getMyNotification,
  updateNotification,
  notifyCustomerForOrderStatus,
  notifyProviderForOrderCancelation,
  createOrderNotification,
  deleteNotification,
};

import { Types } from "mongoose";

export type TNotification = {
  userId: Types.ObjectId;
  mealId?: Types.ObjectId;
  orderId?: Types.ObjectId;
  content: string;
  link?: string;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
};

export type TKitchenSubscriberNotification = {
  kitchenId: string;
  kitchenName: string;
  mealId: string;
};
export type TChangeOrderStatusNotification = {
  mealName: string;
  orderId: string;
  userId: string;
  status: string;
};

export type TCancelNotification = {
  mealName: string;
  orderId: string;
  userId: string;
  status: string;
  customerName: string;
};

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

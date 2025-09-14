import { Types } from "mongoose";

export type TRating = {
  mealId: Types.ObjectId;
  userId: Types.ObjectId;
  orderId: Types.ObjectId;
  rating: number;
  deliveryNumber?: number;
  feedback: string;
  isDeleted: boolean;
};

export type TUpdateRating = {
  rating: number;
  feedback: string;
};

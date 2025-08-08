import { Types } from "mongoose";

export type TRating = {
  mealId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  feedback: string;
};

import { model, Schema } from "mongoose";
import { TRating } from "./rating.interface";

const RatingSchema = new Schema<TRating>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "customer is required"],
    },
    mealId: {
      type: Schema.Types.ObjectId,
      ref: "Meal",
      required: [true, "meal id is required"],
    },
    rating: {
      type: Number,
      required: [true, "rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
    },
  },
  {
    timestamps: true,
  }
);

export const Rating = model<TRating>("Rating", RatingSchema);

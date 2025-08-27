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
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "order id is required"],
    },
    rating: {
      type: Number,
      required: [true, "rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
    },
    deliveryNumber: {
      type: Number,
    },
    feedback: {
      type: String,
      required: [true, "feedback is required"],
      min: [10, "feedback must be 10 character"],
      max: [350, "feedback can`t be more that 350 charcter"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Rating = model<TRating>("Rating", RatingSchema);

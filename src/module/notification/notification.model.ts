import { model, Schema } from "mongoose";
import { TNotification } from "./notification.interface";

const notificationSchema = new Schema<TNotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, "user id is required"],
      ref: "User",
    },
    mealId: {
      type: Schema.Types.ObjectId,
      ref: "Meal",
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    content: {
      type: String,
      required: [true, "content is required"],
      min: [20, "content should me at least 20 character"],
      max: [60, "content can`t be more that 60 character"],
    },
    link: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
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

export const Notification = model<TNotification>(
  "Notification",
  notificationSchema
);

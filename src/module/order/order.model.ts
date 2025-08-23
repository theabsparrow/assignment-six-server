import { model, Schema } from "mongoose";
import { TOrder } from "./order.interface";
import { orderStatus } from "./order.const";
import { weekDays } from "../kitchen/kitchen.const";

const OrderSchema = new Schema<TOrder>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "customer id is required"],
    },
    kitchenId: {
      type: Schema.Types.ObjectId,
      ref: "Kitchen",
      required: [true, "kitchen id is required"],
    },
    mealId: {
      type: Schema.Types.ObjectId,
      ref: "Meal",
      required: [true, "meal id is required"],
    },
    quantity: {
      type: Number,
      required: [true, "quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    totalPrice: {
      type: Number,
      required: [true, "total price is required"],
    },
    status: {
      type: String,
      enum: orderStatus,
      default: "Pending",
    },
    deliveryDays: {
      type: [String],
      enum: weekDays,
      required: [true, "delivery days are required"],
    },
    deliveryTime: {
      type: [String],
      enum: ["Breakfast", "Lunch", "Dinner"],
    },
    deliveryMode: {
      type: String,
      enum: ["mealPlanner", "manual"],
      required: [true, "delivery mode is required"],
    },
    orderType: {
      type: String,
      enum: ["once", "regular"],
      required: [true, "order type is required"],
    },
    isActive: {
      type: Boolean,
    },
    deliveredCount: {
      type: Number,
    },
    endDate: {
      type: String,
    },
    note: {
      type: String,
      min: [10, "notes should be more than 10 charcter"],
      max: [200, "notes can`t be more than 200 character"],
    },
    deliveryAddress: {
      type: String,
      required: [true, "delivery address is required"],
      min: [5, "adderess can`t be less than 5 character "],
      max: [100, "adderess can`t be more than 100 character "],
    },
    payment: {
      type: String,
      enum: ["online", "cash on delivery"],
      required: [true, "payment method is required"],
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

export const Order = model<TOrder>("Order", OrderSchema);

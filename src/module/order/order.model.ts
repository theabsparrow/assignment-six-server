import { model, Schema } from "mongoose";
import { TDeliveryAddress, TOrder } from "./order.interface";
import { orderStatus } from "./order.const";
import { weekDays } from "../kitchen/kitchen.const";

const deliveryAddressSchema = new Schema<TDeliveryAddress>({
  area: {
    type: String,
    required: [true, "area is required"],
  },
  street: {
    type: String,
    required: [true, "street is required"],
  },
  houseNo: {
    type: String,
    required: [true, "house no is required"],
  },
  city: {
    type: String,
    default: "Dhaka",
  },
});

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
    mealPlanner: {
      type: Schema.Types.ObjectId,
      ref: "MealPlanner",
    },
    quantity: {
      type: Number,
      required: [true, "quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    price: {
      type: Number,
      required: [true, "price is required"],
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
    deliveryTime: {
      type: [String],
      enum: ["Breakfast", "Lunch", "Dinner"],
    },
    deliveryMode: {
      type: String,
      enum: ["mealPlanner", "manual"],
      default: "manual",
    },
    deliveryDays: {
      type: [String],
      enum: weekDays,
    },
    orderType: {
      type: String,
      enum: ["once", "regular"],
      required: [true, "order type is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deliveredCount: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: String,
      required: true,
    },
    note: {
      type: String,
    },
    deliveryAddress: {
      type: deliveryAddressSchema,
      required: [true, "delivery address is required"],
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

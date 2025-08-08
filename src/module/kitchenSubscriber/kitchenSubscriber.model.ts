import { model, Schema } from "mongoose";
import { TKitchenSubscriber } from "./kitchenSubscriber.interface";
import { userRole } from "../user/user.const";

const KitchenSubscriberSchema = new Schema<TKitchenSubscriber>(
  {
    kitchen: {
      type: Schema.Types.ObjectId,
      required: [true, "kitchen id is required"],
      ref: "Kitchen",
    },
    user: {
      type: Schema.Types.ObjectId,
      required: [true, "user id is required"],
      ref: "User",
    },
    subscriberRole: {
      type: String,
      enum: userRole,
      required: [true, "role is required"],
    },
  },
  {
    timestamps: true,
  }
);

export const KitchenSubscriber = model<TKitchenSubscriber>(
  "KitchenSubscriber",
  KitchenSubscriberSchema
);

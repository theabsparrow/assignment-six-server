import { model, Schema } from "mongoose";
import { TSubscriber } from "./subscriber.interface";

const subscriberSchema = new Schema<TSubscriber>(
  {
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
    },
    status: {
      type: String,
      default: "active",
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

export const Subscriber = model<TSubscriber>("Subscriber", subscriberSchema);

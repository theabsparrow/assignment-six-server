import { model, Schema } from "mongoose";
import { TCustomer } from "./customer.interface";
import {
  allergyOptions,
  foodPreferance,
  gender,
  mealTime,
} from "./customer.const";

const customerSchema = new Schema<TCustomer>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: [true, "user ID is required"],
      unique: true,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
    },
    profileImage: String,
    address: {
      type: String,
      required: [true, "address is required"],
      trim: true,
    },
    preferredMealTime: {
      type: String,
      enum: mealTime,
    },
    foodPreference: {
      type: [String],
      enum: foodPreferance,
    },
    allergies: {
      type: [String],
      enum: allergyOptions,
    },
    gender: {
      type: String,
      enum: gender,
      required: [true, "gender is required"],
    },
    dateOfBirth: {
      type: String,
      required: [true, "birth date is required"],
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

export const Customer = model<TCustomer>("Customer", customerSchema);

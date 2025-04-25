import { Schema, model } from "mongoose";
import { TKitchen } from "./kitchen.interface";
import { foodPreferance, mealTime, weekDays } from "./kitchen.const";

const KitchenSchema = new Schema<TKitchen>(
  {
    kitchenName: {
      type: String,
      required: [true, "kitchen name is required"],
      trim: true,
    },
    kitchenType: {
      type: String,
      enum: ["Home-based", "Commercial"],
      required: [true, "kitchen type is required"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "MealProvider",
      required: [true, "kitchen owner is required"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "phone number is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "kitchen location is required"],
      trim: true,
    },
    kitchenPhotos: {
      type: String,
      required: [true, "kitchen photo is required"],
    },
    foodPreference: {
      type: [String],
      enum: foodPreferance,
      required: [true, "food preference is required"],
    },
    hygieneCertified: {
      type: Boolean,
      default: false,
    },
    licenseOrCertificate: {
      type: String,
      trim: true,
    },
    foodHandlerExperience: {
      type: String,
      required: [true, "experienced is required"],
    },
    mealTimePerDay: {
      type: [String],
      enum: mealTime,
      required: [true, "meal time is required"],
    },
    cookingDays: {
      type: [String],
      enum: weekDays,
      required: [true, "cooking day is required"],
    },
    specialEquipments: {
      type: [String],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Kitchen = model<TKitchen>("Kitchen", KitchenSchema);

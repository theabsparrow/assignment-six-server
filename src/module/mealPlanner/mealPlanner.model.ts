import { model, Schema } from "mongoose";
import { TMealPlanner } from "./mealPlanner.interface";
import { foodPreferance, mealTime, weekDays } from "../kitchen/kitchen.const";
import { diateryPreference } from "./mealPlanner.const";

const mealPlannerSchema = new Schema<TMealPlanner>(
  {
    title: {
      type: String,
      required: [true, "title is required"],
      unique: true,
      trim: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      required: [true, "customer id is required"],
      ref: "Customer",
    },
    preferredMealTime: {
      type: [String],
      enum: mealTime,
      required: [true, "meal time is required"],
    },
    preferredMealDay: {
      type: [String],
      enum: weekDays,
      required: [true, "meal day is required"],
    },
    foodPreference: {
      type: [String],
      enum: foodPreferance,
      required: [true, "food preference is required"],
    },
    dietaryPreferences: {
      type: [String],
      enum: diateryPreference,
      required: [true, "diatery preference is required"],
    },
    notes: {
      type: String,
      required: [true, "notes is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
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

export const MealPlanner = model<TMealPlanner>(
  "MealPlanner",
  mealPlannerSchema
);

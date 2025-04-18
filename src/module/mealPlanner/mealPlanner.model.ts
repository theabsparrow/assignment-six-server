import { model, Schema } from "mongoose";
import { TMealPlanner } from "./mealPlanner.interface";
import { foodPreferance, mealTime } from "./mealPlanner.const";

const mealPlannerSchema = new Schema<TMealPlanner>(
  {
    preferredMealTime: {
      type: [String],
      enum: mealTime,
      required: [true, "meal time is required"],
    },
    foodPreference: {
      type: [String],
      enum: foodPreferance,
      required: [true, "food preference is required"],
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

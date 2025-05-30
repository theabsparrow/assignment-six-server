import { model, Schema } from "mongoose";
import { TMeal } from "./meal.interface";
import { diateryPreference } from "../mealPlanner/mealPlanner.const";
import { cuisineType, foodCategory, portionSize } from "./meal.const";
import { foodPreferance, mealTime, weekDays } from "../kitchen/kitchen.const";
import { allergyOptions } from "../customer/customer.const";

const MealSchema = new Schema<TMeal>(
  {
    kitchen: {
      type: Schema.Types.ObjectId,
      ref: "Kitchen",
      required: [true, "kitchenid is required"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "MealProvider",
      required: [true, "meal provider is required"],
    },
    title: {
      type: String,
      required: [true, "Meal title is required"],
    },
    description: {
      type: String,
      required: [true, "Meal description is required"],
    },
    dietaryPreferences: {
      type: [String],
      enum: diateryPreference,
      required: [true, "At least one dietaryPreferences is required"],
    },
    foodCategory: {
      type: String,
      enum: foodCategory,
      required: [true, "Food category is required"],
    },
    cuisineType: {
      type: String,
      enum: cuisineType,
      required: [true, "Cuisine type is required"],
    },
    foodPreference: {
      type: String,
      enum: foodPreferance,
      required: [true, "Food preference is required"],
    },
    ingredients: {
      type: [String],
      required: [true, "At least one ingredient is required"],
    },
    allergies: {
      type: [String],
      enum: allergyOptions,
      required: [true, "Allergies are required"],
    },
    portionSize: {
      type: String,
      enum: portionSize,
      required: [true, "Portion size is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    rating: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    availableDays: {
      type: [String],
      enum: weekDays,
      required: [true, "Available days are required"],
    },
    availableTime: {
      type: [String],
      enum: mealTime,
      required: [true, "Available time is required"],
    },
    isAvailable: {
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

export const Meal = model<TMeal>("Meal", MealSchema);

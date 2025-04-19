import { z } from "zod";
import { diateryPreference } from "../mealPlanner/mealPlanner.const";
import { cuisineType, foodCategory, portionSize } from "./meal.const";
import { allergyOptions } from "../customer/customer.const";
import { foodPreferance, mealTime, weekDays } from "../kitchen/kitchen.const";

const mealValidationSchema = z.object({
  title: z.string().min(1, "Meal title is required"),
  description: z.string().min(1, "Meal description is required"),
  dietaryPreferences: z
    .array(z.enum([...diateryPreference] as [string, ...string[]]))
    .min(1, "At least one dietary preference is required"),
  foodCategory: z.enum([...foodCategory] as [string, ...string[]], {
    required_error: "Food category is required",
  }),
  cuisineType: z.enum([...cuisineType] as [string, ...string[]], {
    required_error: "Cuisine type is required",
  }),
  foodPreference: z.enum([...foodPreferance] as [string, ...string[]], {
    required_error: "Food preference is required",
  }),
  ingredients: z
    .array(z.string())
    .min(1, "At least one ingredient is required"),
  allergies: z
    .array(z.enum([...allergyOptions] as [string, ...string[]]))
    .min(1, "At least one allergy option is required"),
  portionSize: z.enum([...portionSize] as [string, ...string[]], {
    required_error: "Portion size is required",
  }),
  price: z.number({ required_error: "Price is required" }),
  imageUrl: z.string().url("Image URL must be a valid URL"),
  availableDays: z
    .array(z.enum([...weekDays] as [string, ...string[]]))
    .min(1, "Available days are required"),
  availableTime: z
    .array(z.enum([...mealTime] as [string, ...string[]]))
    .min(1, "Available time is required"),
});

export const mealValidation = {
  mealValidationSchema,
};

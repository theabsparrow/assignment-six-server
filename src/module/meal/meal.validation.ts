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

const updateMealValidationSchema = z.object({
  title: z.string().min(1, "Meal title is required").optional(),
  description: z.string().min(1, "Meal description is required").optional(),
  addDietaryPreferences: z
    .array(z.enum([...diateryPreference] as [string, ...string[]]))
    .min(1, "At least one dietary preference is required")
    .optional(),
  removeDietaryPreferences: z
    .array(z.enum([...diateryPreference] as [string, ...string[]]))
    .min(1, "At least one dietary preference is required")
    .optional(),
  foodCategory: z.enum([...foodCategory] as [string, ...string[]]).optional(),
  cuisineType: z.enum([...cuisineType] as [string, ...string[]]).optional(),
  foodPreference: z
    .enum([...foodPreferance] as [string, ...string[]])
    .optional(),
  addIngredients: z
    .array(z.string())
    .min(1, "At least one ingredient is required")
    .optional(),
  removeIngredients: z
    .array(z.string())
    .min(1, "At least one ingredient is required")
    .optional(),
  addAllergies: z
    .array(z.enum([...allergyOptions] as [string, ...string[]]))
    .min(1, "At least one allergy option is required")
    .optional(),
  removeAllergies: z
    .array(z.enum([...allergyOptions] as [string, ...string[]]))
    .min(1, "At least one allergy option is required")
    .optional(),
  portionSize: z.enum([...portionSize] as [string, ...string[]]).optional(),
  price: z.number({ invalid_type_error: "price must be number" }).optional(),
  imageUrl: z.string().url("Image URL must be a valid URL").optional(),
  addAvailableDays: z
    .array(z.enum([...weekDays] as [string, ...string[]]))
    .min(1, "Available days are required")
    .optional(),
  removeAvailableDays: z
    .array(z.enum([...weekDays] as [string, ...string[]]))
    .min(1, "Available days are required")
    .optional(),
  addAvailableTime: z
    .array(z.enum([...mealTime] as [string, ...string[]]))
    .min(1, "Available time is required")
    .optional(),
  removeAvailableTime: z
    .array(z.enum([...mealTime] as [string, ...string[]]))
    .min(1, "Available time is required")
    .optional(),
  isAvailable: z.boolean().optional(),
});

export const mealValidation = {
  mealValidationSchema,
  updateMealValidationSchema,
};

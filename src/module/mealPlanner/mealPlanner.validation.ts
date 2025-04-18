import { z } from "zod";
import { foodPreferance, mealTime, weekDays } from "../kitchen/kitchen.const";
import { diateryPreference } from "./mealPlanner.const";

const mealPlannerValidationSchema = z.object({
  title: z
    .string({
      required_error: "title is required",
    })
    .min(1, "title is required"),
  preferredMealTime: z.array(z.enum([...mealTime] as [string, ...string[]])),
  preferredMealDay: z.array(z.enum([...weekDays] as [string, ...string[]])),
  foodPreference: z.array(z.enum([...foodPreferance] as [string, ...string[]])),
  dietaryPreferences: z.array(
    z.enum([...diateryPreference] as [string, ...string[]])
  ),
  notes: z
    .string({
      required_error: "title is required",
    })
    .min(1, "title is required"),
});

const updateMealPlannerValidationSchema = z.object({
  title: z.string().min(1, "title is required").optional(),
  addPreferredMealTime: z
    .array(z.enum([...mealTime] as [string, ...string[]]))
    .optional(),
  removePreferredMealTime: z
    .array(z.enum([...mealTime] as [string, ...string[]]))
    .optional(),
  addFoodPreference: z
    .array(z.enum([...foodPreferance] as [string, ...string[]]))
    .optional(),
  removeFoodPreference: z
    .array(z.enum([...foodPreferance] as [string, ...string[]]))
    .optional(),
  addPreferredMealDay: z
    .array(z.enum([...weekDays] as [string, ...string[]]))
    .optional(),
  removePreferredMealDay: z
    .array(z.enum([...weekDays] as [string, ...string[]]))
    .optional(),
  addDietaryPreferences: z
    .array(z.enum([...diateryPreference] as [string, ...string[]]))
    .optional(),
  removeDietaryPreferences: z
    .array(z.enum([...diateryPreference] as [string, ...string[]]))
    .optional(),
  notes: z.string().min(1, "title is required").optional(),
  isActive: z.boolean().optional(),
});

export const mealPlannerValidation = {
  mealPlannerValidationSchema,
  updateMealPlannerValidationSchema,
};

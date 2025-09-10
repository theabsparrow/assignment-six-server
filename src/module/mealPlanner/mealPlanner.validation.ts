import { z } from "zod";
import { diateryPreference } from "./mealPlanner.const";
import { foodPreferenceOptions, mealTime, weekDays } from "../meal/meal.const";

const mealPlannerValidationSchema = z.object({
  title: z
    .string({
      required_error: "title is required",
    })
    .min(1, "title is required")
    .max(100, "title can`t be more than 100 character"),
  preferredMealTime: z.array(z.enum([...mealTime] as [string, ...string[]])),
  preferredMealDay: z.array(z.enum([...weekDays] as [string, ...string[]])),
  foodPreference: z.enum([...foodPreferenceOptions] as [string, ...string[]]),
  dietaryPreferences: z.array(
    z.enum([...diateryPreference] as [string, ...string[]])
  ),
  notes: z
    .string({
      required_error: "note is required",
    })
    .min(10, "note should be at least 5 character")
    .max(300, "notes can1t be more than 500 character"),
});

const updateMealPlannerValidationSchema = z.object({
  title: z
    .string()
    .min(1, "title is required")
    .max(100, "title can`t be more than 100 character")
    .optional(),
  foodPreference: z
    .enum([...foodPreferenceOptions] as [string, ...string[]])
    .optional(),
  addPreferredMealTime: z
    .array(z.enum([...mealTime] as [string, ...string[]]))
    .optional(),
  removePreferredMealTime: z
    .array(z.enum([...mealTime] as [string, ...string[]]))
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
  notes: z
    .string()
    .min(10, "title is required")
    .max(300, "notes can1t be more than 500 character")
    .optional(),
  isActive: z.boolean().optional(),
});

export const mealPlannerValidation = {
  mealPlannerValidationSchema,
  updateMealPlannerValidationSchema,
};

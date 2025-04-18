import { z } from "zod";
import { foodPreferance, mealTime } from "./mealPlanner.const";

const mealPlannerValidationSchema = z.object({
  preferredMealTime: z.array(z.enum([...mealTime] as [string, ...string[]])),
  foodPreference: z
    .array(z.enum([...foodPreferance] as [string, ...string[]]))
    .optional(),
});

const updateMealPlannerValidationSchema = z.object({
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
});

export const mealPlannerValidation = {
  mealPlannerValidationSchema,
  updateMealPlannerValidationSchema,
};

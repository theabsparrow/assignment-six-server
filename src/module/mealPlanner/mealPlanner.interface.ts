import { Types } from "mongoose";
import { TFoodPreference, TMealDay, TMealTime } from "../meal/meal.interface";

export type TDietaryPreference =
  | "Vegan"
  | "Vegetarian"
  | "Keto"
  | "Paleo"
  | "Gluten-Free"
  | "Regular"
  | "Halal"
  | "Low-Carb"
  | "Diabetic-Friendly"
  | "Low-Fat"
  | "High-Protein"
  | "Dairy-Free"
  | "Nut-Free"
  | "High Fiber"
  | "Low-Sodium"
  | "Raw Food"
  | "Organic"
  | "Plant-Based";

export type TMealPlanner = {
  title: string;
  customer: Types.ObjectId;
  preferredMealTime: TMealTime[];
  preferredMealDay: TMealDay[];
  foodPreference: TFoodPreference;
  dietaryPreferences: TDietaryPreference[];
  notes: string;
  isActive: boolean;
  isDeleted: boolean;
};

export interface TExtendedMealPlanner extends TMealPlanner {
  addPreferredMealTime: TMealTime[];
  removePreferredMealTime: TMealTime[];
  addPreferredMealDay: TMealDay[];
  removePreferredMealDay: TMealDay[];
  addDietaryPreferences: TDietaryPreference[];
  removeDietaryPreferences: TDietaryPreference[];
}

import { Types } from "mongoose";
import { FoodPreferenceOption } from "../kitchen/kitchen.interface";
import { TMealDay, TMealTime } from "../meal/meal.interface";

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
  foodPreference: FoodPreferenceOption;
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

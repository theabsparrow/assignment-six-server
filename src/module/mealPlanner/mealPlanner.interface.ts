import { Types } from "mongoose";
import {
  FoodPreferenceOption,
  TCookingDay,
  TMealTime,
} from "../kitchen/kitchen.interface";

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
  preferredMealDay: TCookingDay[];
  foodPreference: FoodPreferenceOption;
  dietaryPreferences: TDietaryPreference[];
  notes: string;
  isActive: boolean;
  isDeleted: boolean;
};

export interface TExtendedMealPlanner extends TMealPlanner {
  addPreferredMealTime: FoodPreferenceOption[];
  removePreferredMealTime: FoodPreferenceOption[];
  addPreferredMealDay: TCookingDay[];
  removePreferredMealDay: TCookingDay[];
  addDietaryPreferences: TDietaryPreference[];
  removeDietaryPreferences: TDietaryPreference[];
}

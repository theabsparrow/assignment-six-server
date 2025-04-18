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
  | "Regular";

export type TMealPlanner = {
  title: string;
  customer: Types.ObjectId;
  preferredMealTime: TMealTime[];
  preferredMealDay: TCookingDay[];
  foodPreference: FoodPreferenceOption[];
  dietaryPreferences: TDietaryPreference[];
  notes: string;
  isActive: boolean;
  isDeleted: boolean;
};

export interface TExtendedMealPlanner extends TMealPlanner {
  addPreferredMealTime: FoodPreferenceOption[];
  removePreferredMealTime: FoodPreferenceOption[];
  addFoodPreference: FoodPreferenceOption[];
  removeFoodPreference: FoodPreferenceOption[];
  addPreferredMealDay: TCookingDay[];
  removePreferredMealDay: TCookingDay[];
  addDietaryPreferences: TDietaryPreference[];
  removeDietaryPreferences: TDietaryPreference[];
}

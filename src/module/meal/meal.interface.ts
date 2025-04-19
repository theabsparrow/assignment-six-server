import { Types } from "mongoose";
import { TDietaryPreference } from "../mealPlanner/mealPlanner.interface";
import {
  FoodPreferenceOption,
  TCookingDay,
  TMealTime,
} from "../kitchen/kitchen.interface";
import { TAlergies } from "../customer/customer.interface";

export type TFoodCategory = TMealTime | "Snack";
export type TcuisineType =
  | "Bengali"
  | "Indian"
  | "Chinese"
  | "Continental"
  | "Italian"
  | "Thai"
  | "American"
  | "Mediterranean";

export type TPortionSize = "Small" | "Medium" | "Large";
export type TMeal = {
  kitchen?: Types.ObjectId;
  owner: Types.ObjectId;
  title: string;
  description: string;
  dietaryPreferences: TDietaryPreference[];
  foodCategory: TFoodCategory;
  cuisineType: TcuisineType;
  foodPreference: FoodPreferenceOption;
  ingredients: string[];
  allergies: TAlergies[];
  portionSize: TPortionSize;
  price: number;
  rating?: number;
  imageUrl: string;
  availableDays: TCookingDay[];
  availableTime: TMealTime[];
  isAvailable: boolean;
  isDeleted: boolean;
};

export interface TExtendedMeals extends TMeal {
  addDietaryPreferences: TDietaryPreference[];
  removeDietaryPreferences: TDietaryPreference[];
  addIngredients: string[];
  removeIngredients: string[];
  addAllergies: TAlergies[];
  removeAllergies: TAlergies[];
  addAvailableDays: TCookingDay[];
  removeAvailableDays: TCookingDay[];
  addAvailableTime: TMealTime[];
  removeAvailableTime: TMealTime[];
}

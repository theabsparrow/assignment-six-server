import { Types } from "mongoose";
import { TDietaryPreference } from "../mealPlanner/mealPlanner.interface";
import { FoodPreferenceOption } from "../kitchen/kitchen.interface";
import { TAlergies } from "../customer/customer.interface";

export type TcuisineType =
  | "Bengali"
  | "Indian"
  | "Chinese"
  | "Continental"
  | "Italian"
  | "Thai"
  | "American"
  | "Mediterranean"
  | "Mexican"
  | "Turkish"
  | "Persian"
  | "Spanish"
  | "French"
  | "Japanese"
  | "Korean";

export type TMealTime =
  | "Breakfast"
  | "Brunch"
  | "Lunch"
  | "Snack"
  | "Dinner"
  | "Supper"
  | "Tea Time"
  | "Midnight Snack";

export type TFoodCategory =
  | TMealTime
  | "Appetizer"
  | "Dessert"
  | "Beverage"
  | "Side Dish"
  | "Sea Food"
  | "Street Food & Fast Food"
  | "Healthy Meal";

export type TMealDay =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export type TFoodPreference =
  | FoodPreferenceOption
  | "Vegan"
  | "Pescatarian"
  | "Eggetarian"
  | "Halal"
  | "Kosher"
  | "Jain";

export type TPortionSize = "Small" | "Medium" | "Large";

export type TMeal = {
  kitchen: Types.ObjectId;
  owner: Types.ObjectId;
  title: string;
  description: string;
  dietaryPreferences: TDietaryPreference[];
  foodCategory: TFoodCategory;
  cuisineType: TcuisineType;
  foodPreference: TFoodPreference;
  ingredients: string[];
  allergies: TAlergies[];
  portionSize: TPortionSize;
  price: number;
  avarageRating: number;
  ratingCount: number;
  imageUrl: string;
  availableDays: TMealDay[];
  availableTime: TMealTime[];
  isAvailable: boolean;
  isDeleted: boolean;
};

export interface TsearchedMeals extends TMeal {
  _id: Types.ObjectId;
}

export interface TExtendedMeals extends TMeal {
  addDietaryPreferences: TDietaryPreference[];
  removeDietaryPreferences: TDietaryPreference[];
  addIngredients: string[];
  removeIngredients: string[];
  addAllergies: TAlergies[];
  removeAllergies: TAlergies[];
  addAvailableDays: TMealDay[];
  removeAvailableDays: TMealDay[];
  addAvailableTime: TMealTime[];
  removeAvailableTime: TMealTime[];
}

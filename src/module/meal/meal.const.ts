import { foodPreferance } from "../kitchen/kitchen.const";
import {
  TcuisineType,
  TFoodCategory,
  TFoodPreference,
  TMealDay,
  TMealTime,
  TPortionSize,
} from "./meal.interface";

export const cuisineType: TcuisineType[] = [
  "Bengali",
  "Indian",
  "Chinese",
  "Continental",
  "Italian",
  "Thai",
  "American",
  "Mediterranean",
  "Mexican",
  "Turkish",
  "Persian",
  "Spanish",
  "French",
  "Japanese",
  "Korean",
];

export const portionSize: TPortionSize[] = ["Small", "Medium", "Large"];
export const foodPreferenceOptions: TFoodPreference[] = [
  ...foodPreferance,
  "Vegan",
  "Pescatarian",
  "Eggetarian",
  "Halal",
  "Kosher",
  "Jain",
];

export const weekDays: TMealDay[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const mealTime: TMealTime[] = [
  "Breakfast",
  "Brunch",
  "Lunch",
  "Snack",
  "Dinner",
  "Supper",
  "Tea Time",
  "Midnight Snack",
] as const;

export const foodCategory: TFoodCategory[] = [
  ...mealTime,
  "Appetizer",
  "Dessert",
  "Beverage",
  "Side Dish",
  "Sea Food",
  "Street Food & Fast Food",
  "Healthy Meal",
];

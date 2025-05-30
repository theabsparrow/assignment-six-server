import {
  FoodPreferenceOption,
  TCookingDay,
  TMealTime,
} from "./kitchen.interface";

export const weekDays: TCookingDay[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const kitchenType: string[] = ["Home-based", "Commercial"];

export const mealTime: TMealTime[] = ["Breakfast", "Lunch", "Dinner"] as const;

export const foodPreferance: FoodPreferenceOption[] = [
  "Veg",
  "Non-Veg",
  "Mixed",
] as const;

import { FoodPreferenceOption, TMealTime } from "./mealPlanner.interface";

export const mealTime: TMealTime[] = ["Breakfast", "Lunch", "Dinner"] as const;
export const foodPreferance: FoodPreferenceOption[] = [
  "Veg",
  "Non-Veg",
  "Mixed",
] as const;

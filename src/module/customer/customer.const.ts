import { TAlergies } from "./customer.interface";
export const allergyOptions: TAlergies[] = [
  "Egg",
  "Nuts",
  "Milk",
  "Gluten",
  "Shellfish",
  "Soy",
  "Wheat",
  "Fish",
  "Sesame",
  "Peanuts",
  "None",
] as const;

export const mealTime = ["Breakfast", "Lunch", "Dinner"] as const;
export const foodPreferance = ["Veg", "Non-Veg", "Mixed"] as const;
export const gender = ["Male", "Female", "Other"] as const;

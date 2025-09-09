import { FoodPreferenceOption } from "./kitchen.interface";

export const kitchenType: string[] = ["Home-based", "Commercial"];
export const foodPreferance: FoodPreferenceOption[] = [
  "Veg",
  "Non-Veg",
  "Mixed",
] as const;

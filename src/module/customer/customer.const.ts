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
  "Dairy",
] as const;

export const gender = ["Male", "Female", "Other"] as const;
export const searchableFields: string[] = ["name", "phone", "email"];

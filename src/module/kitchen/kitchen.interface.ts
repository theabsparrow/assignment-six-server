import { Types } from "mongoose";

export type TMealTime = "Breakfast" | "Lunch" | "Dinner";
export type TCookingDay =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export type FoodPreferenceOption = "Veg" | "Non-Veg" | "Mixed";

export type TKitchen = {
  kitchenName: string;
  kitchenType: "Home-based" | "Commercial";
  owner: Types.ObjectId;
  location: string;
  kitchenPhoto: string;
  hygieneCertified: boolean;
  hygieneCertificate?: string;
  licenseOrCertificate?: string;
  foodPreference: FoodPreferenceOption[];
  mealTimePerDay: TMealTime[];
  cookingDays: TCookingDay[];
  specialEquipments?: string[];
  isDeleted: boolean;
  isActive: boolean;
};

export interface TExtendedKitchen extends TKitchen {
  addFoodPreference: FoodPreferenceOption[];
  removeFoodPreference: FoodPreferenceOption[];
  addMealTimePerDay: TMealTime[];
  removeMealTimePerDay: TMealTime[];
  addCookingDays: TCookingDay[];
  removeCookingDays: TCookingDay[];
  addSpecialEquipments: string[];
  removeSpecialEquipments: string[];
}

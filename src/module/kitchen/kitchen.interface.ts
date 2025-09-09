import { Types } from "mongoose";

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
  specialEquipments?: string[];
  subscriber: number;
  isDeleted: boolean;
  isActive: boolean;
};

export interface TExtendedKitchen extends TKitchen {
  addFoodPreference: FoodPreferenceOption[];
  removeFoodPreference: FoodPreferenceOption[];
  addSpecialEquipments: string[];
  removeSpecialEquipments: string[];
}

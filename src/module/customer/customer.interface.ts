import { Types } from "mongoose";

export type TMealTime = "Breakfast" | "Lunch" | "Dinner";
export type FoodPreferenceOption = "Veg" | "Non-Veg" | "Mixed";
export type TGender = "Male" | "Female" | "Other";

export type TAlergies =
  | "Egg"
  | "Nuts"
  | "Milk"
  | "Gluten"
  | "Shellfish"
  | "Soy"
  | "Wheat"
  | "Fish"
  | "Sesame"
  | "Peanuts"
  | "None";

export type TCustomer = {
  user: Types.ObjectId;
  name: string;
  email: string;
  profileImage?: string;
  address: string;
  preferredMealTime?: TMealTime;
  foodPreference?: FoodPreferenceOption[];
  allergies?: TAlergies[];
  gender: TGender;
  dateOfBirth: string;
  isDeleted: boolean;
};

export interface TExtendedCustomer extends TCustomer {
  addFoodPreference: FoodPreferenceOption[];
  removeFoodPreference: FoodPreferenceOption[];
  addAllergies: TAlergies[];
  removeAllergies: TAlergies[];
}

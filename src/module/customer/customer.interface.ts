import { Types } from "mongoose";
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
  | "Dairy"
  | "None";

export type TCustomer = {
  user: Types.ObjectId;
  name: string;
  email: string;
  profileImage?: string;
  address: string;
  allergies?: TAlergies[];
  gender: TGender;
  dateOfBirth: string;
  isDeleted: boolean;
};

export interface TExtendedCustomer extends TCustomer {
  addAllergies: TAlergies[];
  removeAllergies: TAlergies[];
}

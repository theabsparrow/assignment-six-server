import { Types } from "mongoose";
import { TMealTime } from "../customer/customer.interface";

export type TCookingDay =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export type TKitchen = {
  kitchenName: string;
  kitchenType: "Home-based" | "Commercial";
  owner: Types.ObjectId;
  location: string;
  phoneNumber: string;
  email: string;
  kitchenPhotos: string[];
  hygieneCertified: boolean;
  licenseOrCertificate?: string;
  foodHandlerExperience: string;
  mealTimePerDay: TMealTime[];
  cookingDays: TCookingDay[];
  specialEquipments?: string[];
  isDeleted: boolean;
  isActive: boolean;
};

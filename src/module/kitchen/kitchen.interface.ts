import { Types } from "mongoose";

export type TKitchen = {
  kitchenName: string;
  kitchenType: "Home-based" | "Commercial";
  owner: Types.ObjectId;
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  kitchenPhotos?: string[];
  hygieneCertified?: boolean;
  licenseOrCertificate?: string;
  foodHandlerExperience?: string;
  maxMealsPerDay?: number;
  cookingDays?: string[];
  specialEquipments?: string[];
  isDeleted: boolean;
};

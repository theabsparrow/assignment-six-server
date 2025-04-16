import { Types } from "mongoose";
import { TGender } from "../customer/customer.interface";

export type TMealProvider = {
  user: Types.ObjectId;
  name: string;
  email: string;
  bio: string;
  profileImage?: string;
  gender: TGender;
  dateOfBirth: string;
  address: string;
  experienceYears?: number;
  isCertified: boolean;
  licenseDocument?: string;
  isDeleted: boolean;
};

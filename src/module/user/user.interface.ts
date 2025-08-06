import { TGender } from "../customer/customer.interface";
import { USER_ROLE } from "./user.const";

export type TStatus = "active" | "blocked";
export type TUSerRole = keyof typeof USER_ROLE;

export type TUSer = {
  email: string;
  phone: string;
  password: string;
  role: TUSerRole;
  status: TStatus;
  passwordChangedAt: Date;
  verifiedWithEmail: boolean;
  isDeleted: boolean;
};

export type TQuery = {
  searchTerm?: string;
  sortBy?: "name" | "status" | "verifiedWithEmail" | "createdAt";
  sortOrder?: "asc" | "desc";
  role?: TUSerRole;
  status?: TStatus;
  verifiedWithEmail?: string;
  gender?: TGender;
  hasKitchen?: string;
  page?: number;
  limit?: number;
};

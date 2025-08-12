import { Types } from "mongoose";
import { TUSerRole } from "../user/user.interface";

export type TKitchenSubscriber = {
  kitchen: Types.ObjectId;
  user: Types.ObjectId;
  subscriberRole: TUSerRole;
};

export type TKitchenSybscriberQuery = {
  searchTerm?: string;
  kitchenType?: "Home-based" | "Commercial";
  isActive?: string;
  sortBy?: "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};

import { TStatus, TUSerRole } from "./user.interface";

export const USER_ROLE = {
  admin: "admin",
  customer: "customer",
  superAdmin: "superAdmin",
  mealProvider: "mealProvider",
} as const;

export const userRole: TUSerRole[] = [
  "admin",
  "customer",
  "superAdmin",
  "mealProvider",
] as const;

export const status: TStatus[] = ["active", "blocked"];

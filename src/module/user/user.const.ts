import { TUSerRole } from "./user.interface";

export const USER_ROLE = {
  admin: "admin",
  customer: "customer",
  superAdmin: "superAdmin",
  "meal provider": "meal provider",
} as const;

export const userRole: TUSerRole[] = [
  "admin",
  "customer",
  "superAdmin",
  "meal provider",
] as const;

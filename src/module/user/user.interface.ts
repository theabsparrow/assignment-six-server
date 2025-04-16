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
  isDeleted: boolean;
};

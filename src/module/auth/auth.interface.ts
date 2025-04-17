import { TUSerRole } from "../user/user.interface";

export type TLogin = {
  email?: string;
  phone?: string;
  password: string;
};

export type TChangePassword = {
  oldPassword: string;
  newPassword: string;
};

export type TJwtPayload = {
  userId: string;
  userRole: TUSerRole;
  otp?: string;
};

import { TStatus } from "../user/user.interface";

export type TSubscriber = {
  email: string;
  status: TStatus;
  isDeleted: boolean;
};

import { Types } from "mongoose";
import { TUSerRole } from "../user/user.interface";

export type TKitchenSubscriber = {
  kitchen: Types.ObjectId;
  user: Types.ObjectId;
  subscriberRole: TUSerRole;
};

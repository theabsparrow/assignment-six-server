import { Types } from "mongoose";
import { TCookingDay, TMealTime } from "../kitchen/kitchen.interface";

export type TOrderType = "once" | "regular";
export type TDeliveryMode = "mealPlanner" | "manual";
export type TOrderStatus = "Pending" | "Confirmed" | "Delivered" | "Cancelled";

export type TOrder = {
  customerId: Types.ObjectId;
  kitchenId: Types.ObjectId;
  mealId: Types.ObjectId;
  quantity: number;
  price: number;
  totalPrice: number;
  status: TOrderStatus;
  deliveryTime: TMealTime[];
  deliveryDays: TCookingDay[];
  deliveryMode: TDeliveryMode;
  orderType: TOrderType;
  isActive?: boolean;
  deliveredCount?: number;
  startDate?: string;
  note?: string;
  deliveryAddress: string;
  payment: "online" | "cash on delivery";
  isDeleted: boolean;
};

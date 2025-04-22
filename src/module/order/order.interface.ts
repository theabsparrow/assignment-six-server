import { Types } from "mongoose";
import { TCookingDay, TMealTime } from "../kitchen/kitchen.interface";

export type TOrderType = "once" | "regular";
export type TDeliveryMode = "mealPlanner" | "manual";
export type TOrderStatus = "Pending" | "Confirmed" | "Delivered" | "Cancelled";
export type TDeliveryAddress = {
  area: string;
  street: string;
  houseNo: string;
  city: "Dhaka";
};

export type TOrder = {
  customerId: Types.ObjectId;
  kitchenId: Types.ObjectId;
  mealId: Types.ObjectId;
  mealPlanner?: Types.ObjectId;
  quantity: number;
  price: number;
  totalPrice: number;
  status: TOrderStatus;
  deliveryTime: TMealTime[];
  deliveryMode: TDeliveryMode;
  deliveryDays?: TCookingDay[];
  orderType: TOrderType;
  isActive?: boolean;
  deliveredCount?: number;
  startDate: string;
  note?: string;
  deliveryAddress: TDeliveryAddress;
  payment: "online" | "cash on delivery";
  isDeleted: boolean;
};

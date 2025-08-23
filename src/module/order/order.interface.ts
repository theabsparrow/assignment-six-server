import { Types } from "mongoose";
import { TCookingDay, TMealTime } from "../kitchen/kitchen.interface";

export type TOrderType = "once" | "regular";
export type TDeliveryMode = "mealPlanner" | "manual";
export type TOrderStatus =
  | "Pending"
  | "Confirmed"
  | "Delivered"
  | "Cancelled"
  | "Cooking"
  | "ReadyForPickup"
  | "OutForDelivery";

export type TOrder = {
  customerId: Types.ObjectId;
  kitchenId: Types.ObjectId;
  mealId: Types.ObjectId;
  quantity: number;
  totalPrice: number;
  status: TOrderStatus;
  deliveryTime: TMealTime[];
  deliveryDays: TCookingDay[];
  deliveryMode: TDeliveryMode;
  orderType: TOrderType;
  isActive?: boolean;
  deliveredCount?: number;
  endDate?: string;
  note?: string;
  deliveryAddress: string;
  payment: "online" | "cash on delivery";
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type TemailOrder = {
  customerName: string;
  customerEmail: string;
  orderDate: string;
  mealName: string;
  totalAmount: number;
  kitchenName: string;
};

export type TemailOrderStatus = {
  customerName: string;
  mealName: string;
  orderStatus: string;
  orderDate: string;
  totalAmount: number;
  kitchenName: string;
  customerEmail: string;
};

export type TgetOrder = {
  _id: string | Types.ObjectId;
  name?: string;
  kitchenName?: string;
};

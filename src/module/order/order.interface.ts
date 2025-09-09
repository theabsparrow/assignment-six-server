import { Types } from "mongoose";
import { TMealDay, TMealTime } from "../meal/meal.interface";

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
export type Tpayment = "online" | "cash on delivery";

export type TOrder = {
  customerId: Types.ObjectId;
  kitchenId: Types.ObjectId;
  mealId: Types.ObjectId;
  quantity: number;
  totalPrice: number;
  status: TOrderStatus;
  deliveryTime: TMealTime[];
  deliveryDays: TMealDay[];
  deliveryMode: TDeliveryMode;
  orderType: TOrderType;
  isActive?: boolean;
  deliveredCount?: number;
  endDate?: string;
  note?: string;
  deliveryAddress: string;
  payment: Tpayment;
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

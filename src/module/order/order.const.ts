import { TDeliveryMode, TOrderStatus, TOrderType } from "./order.interface";

export const orderType: TOrderType[] = ["once", "regular"];
export const deliveryMode: TDeliveryMode[] = ["Meal planner", "manual"];
export const orderStatus: TOrderStatus[] = [
  "Pending",
  "Confirmed",
  "Delivered",
  "Cancelled",
];
export const paymentMethod = ["online", "cash on delivery"];

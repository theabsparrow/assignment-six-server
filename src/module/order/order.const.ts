import { TDeliveryMode, TOrderStatus, TOrderType } from "./order.interface";

export const orderType: TOrderType[] = ["once", "regular"];
export const deliveryMode: TDeliveryMode[] = ["mealPlanner", "manual"];
export const orderStatus: TOrderStatus[] = [
  "Pending",
  "Confirmed",
  "Delivered",
  "Cancelled",
  "Cooking",
  "ReadyForPickup",
  "OutForDelivery",
];
export const paymentMethod = ["online", "cash on delivery"];

import { TCookingDay } from "../kitchen/kitchen.interface";
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

export const dayMap: Record<TCookingDay, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

import { TCookingDay } from "./kitchen.interface";

export const weekDays: TCookingDay[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const kitchenType: string[] = ["Home-based", "Commercial"];

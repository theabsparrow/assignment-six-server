import { z } from "zod";
import { mealTime, weekDays } from "../kitchen/kitchen.const";
import {
  deliveryMode,
  orderStatus,
  orderType,
  paymentMethod,
} from "./order.const";

const orderValidationSchema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1"),
  deliveryTime: z.array(z.enum([...mealTime] as [string, ...string[]])),
  deliveryDays: z.array(z.enum([...weekDays] as [string, ...string[]])),
  deliveryMode: z.enum([...deliveryMode] as [string, ...string[]]),
  orderType: z.enum([...orderType] as [string, ...string[]]),
  note: z
    .string()
    .min(10, { message: "notes should be at least 10 character" })
    .max(200, { message: "notes can`t be more than 200 character" })
    .optional(),
  deliveryAddress: z
    .string()
    .min(5, { message: "address can`t be less than 5 character" })
    .max(100, { message: "address can`t be more than 100 character" }),
  payment: z.enum([...paymentMethod] as [string, ...string[]]),
});

const changeOrderStatusValidationSchema = z.object({
  status: z.enum([...orderStatus] as [string, ...string[]]),
});
export const orderValidation = {
  orderValidationSchema,
  changeOrderStatusValidationSchema,
};

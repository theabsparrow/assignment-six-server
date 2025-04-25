import { z } from "zod";
import { mealTime, weekDays } from "../kitchen/kitchen.const";
import { orderStatus, orderType, paymentMethod } from "./order.const";

// const deliveryAddressSchema = z.object({
//   area: z.string().min(1, "Area is required"),
//   street: z.string().min(1, "Street is required"),
//   houseNo: z.string().min(1, "House No is required"),
// });

const orderValidationSchema = z.object({
  mealPlanner: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(1, "price must be at least 1"),
  deliveryTime: z
    .array(z.enum([...mealTime] as [string, ...string[]]))
    .optional(),
  deliveryDays: z
    .array(z.enum([...weekDays] as [string, ...string[]]))
    .optional(),
  orderType: z.enum([...orderType] as [string, ...string[]]),
  startDate: z.string().min(1, "Start date is required"),
  note: z.string().optional(),
  deliveryAddress: z.string(),
  payment: z.enum([...paymentMethod] as [string, ...string[]]),
});

const changeOrderStatusValidationSchema = z.object({
  status: z.enum([...orderStatus] as [string, ...string[]]),
});
export const orderValidation = {
  orderValidationSchema,
  changeOrderStatusValidationSchema,
};

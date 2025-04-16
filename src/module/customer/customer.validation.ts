import { z } from "zod";
import {
  allergyOptions,
  foodPreferance,
  gender,
  mealTime,
} from "./customer.const";

const customerValidationSchema = z.object({
  user: z.object({
    email: z.string().email("Invalid email").trim(),
    phone: z.string().min(1, "Phone number is required").trim(),
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(6, { message: "password can`t be less than 6 character" })
      .max(20, { message: "password can`t be more than 20 character" })
      .refine(
        (value) => /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/.test(value),
        {
          message:
            "password must be contain one capital letter, one small letter, one number and one special chareacter ",
        }
      ),
  }),
  customer: z.object({
    name: z.string().min(1, "Name is required"),
    profileImage: z.string().url().optional(),
    address: z.string().min(1, "Address is required"),
    preferredMealTime: z
      .enum([...mealTime] as [string, ...string[]])
      .optional(),
    foodPreference: z
      .array(z.enum([...foodPreferance] as [string, ...string[]]))
      .optional(),
    allergies: z
      .array(z.enum([...allergyOptions] as [string, ...string[]]))
      .optional(),
    gender: z.enum([...gender] as [string, ...string[]]),
    dateOfBirth: z.string().min(1, "Birth date is required"),
  }),
});

export const customerValidation = {
  customerValidationSchema,
};

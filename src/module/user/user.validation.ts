import { z } from "zod";

const updateEmailPhoneValidationSchema = z.object({
  email: z.string().email("Invalid email").trim().optional(),
  phone: z.string().min(1, "Phone number is required").trim().optional(),
});

const verifyEmailValidationSchema = z.object({
  otp: z
    .string({
      required_error: "otp is required",
    })
    .min(6, "otp must be 6 character"),
});

export const userValidation = {
  updateEmailPhoneValidationSchema,
  verifyEmailValidationSchema,
};

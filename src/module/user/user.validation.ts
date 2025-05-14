import { z } from "zod";
import { status } from "./user.const";

const updateEmailPhoneValidationSchema = z.object({
  email: z.string().email("Invalid email").trim().optional(),
  phone: z.string().min(1, "Phone number is required").trim().optional(),
  password: z.string().min(1, "Password is required").optional(),
});

const updateStatusValidationSchema = z.object({
  status: z.enum([...status] as [string, ...string[]]),
});

const verifyEmailValidationSchema = z.object({
  otp: z
    .string({
      required_error: "otp is required",
    })
    .min(6, "otp must be 6 character"),
});

const refreshToken1ValidationSchema = z.object({
  refreshToken1: z.string({
    required_error: "refresh token is required",
  }),
});

export const userValidation = {
  updateEmailPhoneValidationSchema,
  verifyEmailValidationSchema,
  updateStatusValidationSchema,
  refreshToken1ValidationSchema,
};

import { z } from "zod";

const authValidationSchema = z.object({
  email: z.string().email().trim().optional(),
  phone: z.string().trim().optional(),
  password: z.string({
    required_error: "password is required",
  }),
});

const passwordChangedValidationSchema = z.object({
  oldPassword: z.string(),
  newPassword: z
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
});

const forgetPasswordValidationSchema = z.object({
  email: z.string().email().trim(),
});

const resetPasswordValidationSchema = z.object({
  otp: z.string().min(6, "otp should be about 6 character"),
});

const setNewPasswordValidationSchema = z.object({
  newPassword: z
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
});
export const authValidation = {
  authValidationSchema,
  passwordChangedValidationSchema,
  forgetPasswordValidationSchema,
  resetPasswordValidationSchema,
  setNewPasswordValidationSchema,
};

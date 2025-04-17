import { z } from "zod";
import { gender } from "../customer/customer.const";

const mealProviderValidationSchema = z.object({
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
  mealProvider: z.object({
    name: z.string().min(1, "Name is required").trim(),
    bio: z.string().min(1, "Bio is required").trim(),
    profileImage: z.string().url("Must be a valid URL").optional(),
    gender: z.enum([...gender] as [string, ...string[]]),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    address: z.string().min(1, "Address is required"),
    experienceYears: z.number().int().nonnegative().optional(),
    isCertified: z.boolean(),
    licenseDocument: z.string().url("Must be a valid URL").optional(),
  }),
});

const updateMealProviderValidationSchema = z.object({
  name: z.string().min(1, "Name is required").trim().optional(),
  bio: z.string().min(1, "Bio is required").trim().optional(),
  profileImage: z.string().url("Must be a valid URL").optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required").optional(),
  address: z.string().min(1, "Address is required").optional(),
  experienceYears: z.number().int().nonnegative().optional(),
  isCertified: z.boolean().optional(),
  licenseDocument: z.string().url("Must be a valid URL").optional().optional(),
});
export const mealProviderValidation = {
  mealProviderValidationSchema,
  updateMealProviderValidationSchema,
};

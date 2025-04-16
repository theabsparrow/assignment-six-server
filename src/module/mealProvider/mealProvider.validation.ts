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
      .min(8, "Password must be at least 8 character"),
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

export const mealProviderValidation = {
  mealProviderValidationSchema,
};

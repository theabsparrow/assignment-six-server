import { z } from "zod";

const authValidationSchema = z.object({
  email: z.string().email().trim().optional(),
  phone: z.string().trim().optional(),
  password: z.string({
    required_error: "password is required",
  }),
});
export const authValidation = {
  authValidationSchema,
};

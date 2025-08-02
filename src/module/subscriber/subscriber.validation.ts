import { z } from "zod";
import { status } from "../user/user.const";

const subscriberValidationSchema = z.object({
  email: z.string().email("Invalid email").trim(),
});
const updateSubscriberValidationschema = z.object({
  status: z.enum([...status] as [string, ...string[]]),
});

export const subscriberValidation = {
  subscriberValidationSchema,
  updateSubscriberValidationschema,
};

import { z } from "zod";

const ratingValidationSchema = z.object({
  rating: z
    .number({
      required_error: "rating is required",
    })
    .min(1, "rating must be at least 1")
    .max(5, "rating will be maximum 5"),
  feedback: z
    .string({
      required_error: "feedback is required",
    })
    .trim()
    .min(10, { message: "feedback should be at least 10 character" })
    .max(350, { message: "feedback can`t be more than 350 character" }),
});

export const ratingValidation = {
  ratingValidationSchema,
};

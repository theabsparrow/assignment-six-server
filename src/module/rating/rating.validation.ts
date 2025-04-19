import { z } from "zod";

const ratingValidationSchema = z.object({
  rating: z
    .number({
      required_error: "rating is required",
    })
    .min(1, "rating must be at least 1")
    .max(5, "rating will be maximum 5"),
});

export const ratingValidation = {
  ratingValidationSchema,
};

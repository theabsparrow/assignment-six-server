import { z } from "zod";

const blogValidationSchema = z.object({
  title: z
    .string({
      required_error: "title is required",
    })
    .min(2, { message: "title can`t be less than 2 charcter" })
    .max(50, { message: "title can`t be more than 50 charcter" })
    .trim(),
  content: z
    .string({ required_error: "content is required" })
    .min(30, { message: "content can`t be less that 50 character" })
    .max(5000, { message: "content can`t be more than 5000 character" })
    .trim(),
  coverImage: z.string().url("cover image must be a valid url"),
  tags: z
    .array(
      z
        .string()
        .max(20, { message: "a single tags can`t be more than 20 character" })
    )
    .optional(),
});

const updateBlogValidationSchema = z.object({
  title: z
    .string({
      required_error: "title is required",
    })
    .min(2, { message: "title can`t be less than 2 charcter" })
    .max(50, { message: "title can`t be more than 50 charcter" })
    .trim()
    .optional(),
  content: z
    .string({ required_error: "content is required" })
    .min(30, { message: "content can`t be less that 50 character" })
    .max(5000, { message: "content can`t be more than 5000 character" })
    .trim()
    .optional(),
  coverImage: z.string().url("cover image must be a valid url").optional(),
  addTags: z
    .array(
      z
        .string()
        .max(20, { message: "a single tags can`t be more than 20 character" })
    )
    .optional(),
  removeTags: z.array(z.string()).optional(),
});
export const blogvalidation = {
  blogValidationSchema,
  updateBlogValidationSchema,
};

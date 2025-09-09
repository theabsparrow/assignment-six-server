import { z } from "zod";
import { foodPreferance, kitchenType } from "./kitchen.const";

const kitchenValidationSchema = z.object({
  kitchenName: z
    .string({ required_error: "Kitchen name is required" })
    .min(1, "Kitchen name must be at least one character")
    .trim(),
  kitchenType: z.enum([...kitchenType] as [string, ...string[]]),
  location: z
    .string({ required_error: "Location is required" })
    .min(1, "Location is required")
    .trim(),
  kitchenPhoto: z
    .string({
      required_error: "photo is reqired",
    })
    .url("Each kitchen photo must be a valid URL"),
  hygieneCertified: z.boolean({
    required_error: "hygine certificate is required",
  }),
  hygieneCertificate: z.string().optional(),
  licenseOrCertificate: z.string().optional(),
  foodPreference: z.array(z.enum([...foodPreferance] as [string, ...string[]])),
  specialEquipments: z.array(z.string()).optional(),
});

const updateKitchenValidationSchema = z.object({
  kitchenName: z
    .string()
    .min(1, "Kitchen name must be at least one character")
    .trim()
    .optional(),
  kitchenType: z.enum([...kitchenType] as [string, ...string[]]).optional(),
  location: z.string().min(1, "Location is required").trim().optional(),
  email: z.string().email("Invalid email").trim().optional(),
  phoneNumber: z.string().min(1, "Phone number is required").trim().optional(),
  kitchenPhotos: z
    .string({
      required_error: "photo is reqired",
    })
    .url("Each kitchen photo must be a valid URL"),
  hygieneCertified: z.boolean().optional(),
  licenseOrCertificate: z.string().optional(),
  addFoodPreference: z
    .array(z.enum([...foodPreferance] as [string, ...string[]]))
    .optional(),
  removeFoodPreference: z
    .array(z.enum([...foodPreferance] as [string, ...string[]]))
    .optional(),
  addSpecialEquipments: z.array(z.string()).optional(),
  removeSpecialEquipments: z.array(z.string()).optional(),
});

const updateStatusValidationSchema = z.object({
  isActive: z.boolean({
    required_error: "status is required",
  }),
});

export const kitchenValidation = {
  kitchenValidationSchema,
  updateKitchenValidationSchema,
  updateStatusValidationSchema,
};

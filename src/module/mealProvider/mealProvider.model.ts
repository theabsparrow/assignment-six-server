import { model, Schema } from "mongoose";
import { TMealProvider } from "./mealProvider.interface";
import { gender } from "../customer/customer.const";

const mealProviderSchema = new Schema<TMealProvider>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user ID is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
    },
    gender: {
      type: String,
      enum: gender,
      required: [true, "gender is required"],
    },
    dateOfBirth: {
      type: String,
      required: [true, "date of birth is required"],
    },
    address: {
      type: String,
      required: [true, "address is required"],
      trim: true,
    },
    bio: {
      type: String,
      required: [true, "bio data is required"],
      trim: true,
    },
    profileImage: {
      type: String,
    },
    experienceYears: {
      type: Number,
      required: [true, "experienced year data is required"],
    },
    isCertified: {
      type: Boolean,
      required: [true, "certefied info is required"],
    },
    licenseDocument: {
      type: String,
      unique: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const MealProvider = model<TMealProvider>(
  "MealProvider",
  mealProviderSchema
);

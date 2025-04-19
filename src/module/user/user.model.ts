/* eslint-disable @typescript-eslint/no-this-alias */
import { model, Schema } from "mongoose";
import { TUSer } from "./user.interface";
import { userRole } from "./user.const";
import bcrypt from "bcrypt";
import config from "../../config";

const UserSchema = new Schema<TUSer>(
  {
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "phone number is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      select: 0,
    },
    role: {
      type: String,
      enum: userRole,
      required: [true, "role is required"],
    },
    status: {
      type: String,
      default: "active",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_round)
  );
  next();
});

UserSchema.post("save", function (data, next) {
  data.password = "";
  next();
});

export const User = model<TUSer>("User", UserSchema);

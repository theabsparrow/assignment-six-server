import { model, Schema } from "mongoose";
import { TSearchLog } from "./searchLog.interface";

const searchLogSchema = new Schema<TSearchLog>(
  {
    query: {
      type: String,
      required: [true, "searchTerm is required"],
    },
    count: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const SearchLog = model<TSearchLog>("SearchLog", searchLogSchema);

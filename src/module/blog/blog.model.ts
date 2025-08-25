import { model, Schema } from "mongoose";
import { TBlog } from "./blog.inteface";
import { blogStatus } from "./blog.const";

const blogSchema = new Schema<TBlog>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      required: [true, "user ID is required"],
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "name is required"],
    },
    title: {
      type: String,
      required: [true, "title is required"],
    },
    content: {
      type: String,
      required: [true, "content is required"],
    },
    excerpts: {
      type: String,
      required: [true, "excerprts is required"],
      max: [250, " excerpts can`t be more than 250 charcter"],
    },
    coverImage: {
      type: String,
    },
    tags: {
      type: [String],
    },
    status: {
      type: String,
      enum: blogStatus,
      default: "published",
    },
    view: {
      type: Number,
      default: 0,
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

export const Blog = model<TBlog>("Blog", blogSchema);

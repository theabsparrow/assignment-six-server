import { Types } from "mongoose";

export type BlogStatus = "published" | "archived";
export type TBlog = {
  authorId: Types.ObjectId;
  name: string;
  title: string;
  content: string;
  excerpts: string;
  coverImage: string;
  tags: string[];
  status: BlogStatus;
  isDeleted: boolean;
};

export interface IBlog extends TBlog {
  addTags: string[];
  removeTags: string[];
}

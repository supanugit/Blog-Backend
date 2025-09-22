import mongoose, { mongo } from "mongoose";
import { ref } from "process";

// Define schema
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      // fixed spelling
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: String,
      // required: true,
    },
  },
  {
    timestamps: true, // 🚀 adds createdAt, updatedAt
  }
);

// Create model
export const Blog = mongoose.model("Blog", blogSchema);

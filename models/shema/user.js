import mongoose from "mongoose";
import { type } from "os";

// Define schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // 🚀 no duplicate emails
      lowercase: true, // 🚀 consistency
      trim: true,
    },
    name: {
      type: String,
      required: true,
      unique: true, // 🚀 no duplicate emails
      trim: true,
    },
    password: {
      // fixed spelling
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
      required: true,
    },
  },
  {
    timestamps: true, // 🚀 adds createdAt, updatedAt
  }
);

// userSchema.index({ email: 1 });

// Create model
export const User = mongoose.model("User", userSchema);

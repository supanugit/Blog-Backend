import mongoose from "mongoose";

const commentsShema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blogId: {
      type: mongoose.Schema.Types.ObjectId,

      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

commentsShema.index({ blogId: 1 });

export const Comment = mongoose.model("Comment", commentsShema);

const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    excerpt: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      default: "Technology",
      trim: true,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    coverImage: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
      index: true,
    },
    readTime: {
      type: Number,
      default: 3,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

postSchema.index({ title: "text", content: "text", excerpt: "text", tags: "text" });

module.exports = mongoose.model("Post", postSchema);
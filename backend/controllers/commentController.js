const Comment = require("../models/Comment");
const Post = require("../models/Post");
const mongoose = require("mongoose");

// ADD COMMENT
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = await Comment.create({
      text: text.trim(),
      post: postId,
      author: req.user.id,
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      "author",
      "name avatar bio"
    );

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET COMMENTS FOR POST
const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
    }

    const comments = await Comment.find({ post: postId })
      .populate("author", "name avatar bio")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE COMMENT
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const post = await Post.findById(comment.post);

    // Allow deletion if user is comment author OR post author
    const isCommentAuthor = comment.author.toString() === req.user.id;
    const isPostAuthor = post && post.author.toString() === req.user.id;

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    await comment.deleteOne();

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addComment,
  getComments,
  deleteComment,
};
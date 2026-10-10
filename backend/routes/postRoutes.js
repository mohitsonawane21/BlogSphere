const express = require("express");
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  toggleBookmark,
  getBookmarkedPosts,
  getMetaInfo,
} = require("../controllers/postController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getPosts);
router.post("/", protect, createPost);
router.get("/meta/categories", getMetaInfo);
router.get("/user/bookmarks", protect, getBookmarkedPosts);
router.get("/:id", getPostById);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.post("/:id/like", protect, toggleLike);
router.post("/:id/bookmark", protect, toggleBookmark);

module.exports = router;
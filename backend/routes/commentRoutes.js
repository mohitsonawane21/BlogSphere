const express = require("express");
const {
  addComment,
  getComments,
  deleteComment,
} = require("../controllers/commentController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:postId", getComments);
router.post("/:postId", protect, addComment);
router.delete("/:id", protect, deleteComment);

module.exports = router;
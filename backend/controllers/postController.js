const Post = require("../models/Post");
const User = require("../models/User");
const mongoose = require("mongoose");

// Helper to calculate reading time in minutes
const calculateReadTime = (content) => {
  if (!content) return 1;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
};

// Helper to extract clean excerpt if not provided
const generateExcerpt = (content) => {
  if (!content) return "";
  const plainText = content.replace(/[#*`_~\[\]]/g, "").trim();
  return plainText.length > 160 ? plainText.substring(0, 157) + "..." : plainText;
};

// CREATE POST
const createPost = async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, coverImage, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const calculatedReadTime = calculateReadTime(content);
    const finalExcerpt = excerpt && excerpt.trim() ? excerpt.trim() : generateExcerpt(content);

    let parsedTags = [];
    if (Array.isArray(tags)) {
      parsedTags = tags.map((t) => t.trim()).filter(Boolean);
    } else if (typeof tags === "string") {
      parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
    }

    const post = await Post.create({
      title: title.trim(),
      content,
      excerpt: finalExcerpt,
      category: category ? category.trim() : "General",
      tags: parsedTags,
      coverImage: coverImage || "",
      status: status === "draft" ? "draft" : "published",
      readTime: calculatedReadTime,
      author: req.user.id,
    });

    const populatedPost = await Post.findById(post._id).populate("author", "name email avatar bio");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL POSTS (With Search, Filtering, Sorting, Pagination)
const getPosts = async (req, res) => {
  try {
    const { search, category, tag, author, status, sort, page = 1, limit = 9 } = req.query;

    const query = {};

    // Filter by status (default 'published')
    if (status) {
      query.status = status;
    } else {
      query.status = "published";
    }

    // Filter by author
    if (author && mongoose.Types.ObjectId.isValid(author)) {
      query.author = author;
    }

    // Filter by category
    if (category && category.toLowerCase() !== "all") {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
    }

    // Filter by tag
    if (tag) {
      query.tags = { $in: [new RegExp(tag.trim(), "i")] };
    }

    // Search query across title, content, excerpt, tags
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { excerpt: searchRegex },
        { tags: { $in: [searchRegex] } },
        { category: searchRegex },
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "title") sortOption = { title: 1 };
    if (sort === "popular") sortOption = { likes: -1, createdAt: -1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 9;
    const skip = (pageNum - 1) * limitNum;

    const totalPosts = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate("author", "name email avatar bio")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPosts,
        totalPages: Math.ceil(totalPosts / limitNum) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE POST BY ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      });
    }

    const post = await Post.findById(id).populate("author", "name email avatar bio createdAt");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Fetch related articles in same category
    const relatedPosts = await Post.find({
      _id: { $ne: post._id },
      category: post.category,
      status: "published",
    })
      .populate("author", "name email avatar")
      .limit(3);

    res.json({
      success: true,
      post,
      relatedPosts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE POST
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, category, tags, coverImage, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this article",
      });
    }

    if (title) post.title = title.trim();
    if (content) {
      post.content = content;
      post.readTime = calculateReadTime(content);
      if (!excerpt) post.excerpt = generateExcerpt(content);
    }
    if (excerpt !== undefined) post.excerpt = excerpt.trim();
    if (category) post.category = category.trim();
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (status) post.status = status;

    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        post.tags = tags.map((t) => t.trim()).filter(Boolean);
      } else if (typeof tags === "string") {
        post.tags = tags.split(",").map((t) => t.trim()).filter(Boolean);
      }
    }

    await post.save();
    const updatedPost = await Post.findById(post._id).populate("author", "name email avatar bio");

    res.json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE POST
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this article",
      });
    }

    await post.deleteOne();

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// TOGGLE LIKE POST
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const likeIndex = post.likes.findIndex((user) => user.toString() === userId);
    let isLiked = false;

    if (likeIndex > -1) {
      // Remove like
      post.likes.splice(likeIndex, 1);
      isLiked = false;
    } else {
      // Add like
      post.likes.push(userId);
      isLiked = true;
    }

    await post.save();

    res.json({
      success: true,
      likesCount: post.likes.length,
      isLiked,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// TOGGLE BOOKMARK POST
const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const bookmarkIndex = user.bookmarks.findIndex((bm) => bm.toString() === id);
    let isBookmarked = false;

    if (bookmarkIndex > -1) {
      user.bookmarks.splice(bookmarkIndex, 1);
      isBookmarked = false;
    } else {
      user.bookmarks.push(id);
      isBookmarked = true;
    }

    await user.save();

    res.json({
      success: true,
      isBookmarked,
      bookmarks: user.bookmarks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET USER BOOKMARKED POSTS
const getBookmarkedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "bookmarks",
      populate: { path: "author", select: "name email avatar bio" },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      bookmarks: user.bookmarks || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET CATEGORIES AND TAGS STATS
const getMetaInfo = async (req, res) => {
  try {
    const categoriesWithCount = await Post.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const tagsAgg = await Post.aggregate([
      { $match: { status: "published" } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    res.json({
      success: true,
      categories: categoriesWithCount.map((c) => ({ name: c._id, count: c.count })),
      popularTags: tagsAgg.map((t) => ({ name: t._id, count: t.count })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  toggleBookmark,
  getBookmarkedPosts,
  getMetaInfo,
};
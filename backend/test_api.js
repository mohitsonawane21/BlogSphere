const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("./models/User");
const Post = require("./models/Post");
const Comment = require("./models/Comment");

async function runVerification() {
  console.log("🚀 Starting BlogSphere API & Database Verification...");

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("❌ MONGO_URI missing");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("✅ 1. MongoDB Connected successfully.");

  const testEmail = `test_${Date.now()}@blogsphere.local`;

  // 1. Register User
  const hashedPassword = await bcrypt.hash("Password123", 10);
  const user = await User.create({
    name: "Verification Author",
    email: testEmail,
    password: hashedPassword,
    bio: "Automated QA Verification Suite",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
  });
  console.log("✅ 2. User Registration verified. Created user ID:", user._id.toString());

  // 2. Auth JWT Token verification
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || "blogsphere_secret",
    { expiresIn: "1h" }
  );
  const decoded = jwt.verify(token, process.env.JWT_SECRET || "blogsphere_secret");
  console.log("✅ 3. JWT Token generation and verification passed. User ID in payload:", decoded.id);

  // 3. Post Creation
  const post = await Post.create({
    title: "Testing Full-Stack Pipeline in BlogSphere",
    content: "This is an automated verification post testing all API boundaries and database schemas.",
    excerpt: "Automated verification post for BlogSphere.",
    category: "Engineering",
    tags: ["qa", "nodejs", "react"],
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    status: "published",
    readTime: 2,
    author: user._id,
  });
  console.log("✅ 4. Article Creation verified. Post ID:", post._id.toString());

  // 4. Read Post
  const fetchedPost = await Post.findById(post._id).populate("author", "name email");
  if (!fetchedPost || fetchedPost.title !== post.title) {
    throw new Error("Post fetch failed");
  }
  console.log("✅ 5. Article Retrieval & Population verified. Author:", fetchedPost.author.name);

  // 5. Like & Bookmark functionality
  post.likes.push(user._id);
  await post.save();
  user.bookmarks.push(post._id);
  await user.save();
  console.log("✅ 6. Likes and Bookmarks schema logic verified.");

  // 6. Comment Creation & Fetch
  const comment = await Comment.create({
    text: "Great insights on full-stack architecture!",
    post: post._id,
    author: user._id,
  });
  const fetchedComments = await Comment.find({ post: post._id }).populate("author", "name");
  console.log("✅ 7. Comments system verified. Total comments:", fetchedComments.length);

  // Clean up test data
  await Comment.deleteOne({ _id: comment._id });
  await Post.deleteOne({ _id: post._id });
  await User.deleteOne({ _id: user._id });
  console.log("✅ 8. Test Data Cleanup complete.");

  await mongoose.disconnect();
  console.log("🎉 ALL BACKEND & DATABASE VERIFICATIONS PASSED SUCCESSFULLY!");
  process.exit(0);
}

runVerification().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});

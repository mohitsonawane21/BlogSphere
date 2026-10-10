const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" }));

// Rate limiting for Auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

// Routes
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "BlogSphere API is running 🚀",
    version: "2.0.0",
    database: mongoose.connection.readyState === 1 ? "connected" : "connecting/disconnected",
  });
});

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Endpoint Not Found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Centralized Server Error:", err);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ CRITICAL: MONGO_URI is missing in environment variables!");
} else {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("✅ MongoDB connected successfully to BlogSphere");
    })
    .catch((error) => {
      console.error("❌ MongoDB connection failed:", error.message);
    });
}

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 BlogSphere server running on http://localhost:${PORT}`);
});
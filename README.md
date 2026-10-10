# BlogSphere — Premium Editorial Blogging Platform 🚀

BlogSphere is a modern full-stack publishing platform designed with editorial aesthetics, responsive user experience, robust REST APIs, and MongoDB data persistence.

---

## 🌟 Key Features

### 🎨 Editorial UI & Design System
- **Hero & Story Spotlight**: Featured article carousel and story cards with category badges, reading time estimators, and author avatars.
- **Explore & Live Search**: Instant full-text search across titles, contents, excerpts, and tags.
- **Filtering & Sorting**: Filter articles by category or tag, with sorting options (Newest, Oldest, Most Liked, Title A-Z).
- **Pagination**: Backend-driven pagination with limit and page controls.
- **Responsive Navigation**: Sticky header with quick search, desktop links, and mobile slide-out drawer menu.

### 📝 Core Editorial & Author Workflows
- **Publish & Draft States**: Support for published articles and private draft previews.
- **Article Writing & Editing**: Dual-mode editor (Write Mode & Live Article Preview) with title, excerpt, category, cover image URL, and tags.
- **Single Article View**: Article details with read-time metadata, author bio card, and related stories.
- **Likes & Bookmarks**: Live heart-like toggles and personal bookmarking system persistent in database.
- **Discussion System**: Comment threads with author populating and deletion permissions for comment or post authors.

### 🔐 Security & Backend Architecture
- **JWT Authentication**: Password hashing with `bcryptjs`, 7-day signed JWT tokens, session restoration via `GET /api/auth/me`.
- **Resource Ownership Verification**: Strict checks ensuring users can only modify or delete their own articles/comments.
- **Rate Limiting & CORS**: Rate-limited sensitive authentication routes using `express-rate-limit` to prevent brute-force attacks.
- **Centralized Error Handling**: Safe API error responses preventing internal stack traces from leaking to clients.

---

## 🏗️ Tech Stack

- **Frontend**: React 19, Vite 8, React Router DOM 7, Tailwind CSS v4, Lucide React, Axios.
- **Backend**: Node.js, Express 5, MongoDB Atlas, Mongoose 9, JWT, BcryptJS, Express Rate Limit.

---

## ⚙️ Environment Configuration

### Backend `.env` (`backend/.env.example`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/BlogSphere?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_ORIGIN=https://blogsphere.vercel.app
NODE_ENV=production
```

### Frontend `.env` (`frontend/.env.example`)
```env
VITE_API_URL=https://blogsphere-backend.onrender.com/api
```

---

## 🌐 Production Deployment Guide

### Step 1: MongoDB Atlas Preparation
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Under **Network Access**, add IP `0.0.0.0/0` (Allow Access from Anywhere) so Render cloud instances can connect.
3. Obtain your database connection string under **Database > Connect**.

### Step 2: Deploy Backend to Render
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New > Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add **Environment Variables**:
   - `MONGO_URI` = `your_mongodb_atlas_connection_string`
   - `JWT_SECRET` = `your_random_secret_string`
   - `CLIENT_ORIGIN` = `https://your-frontend-app.vercel.app`
   - `NODE_ENV` = `production`
5. Click **Create Web Service**. Once deployed, copy your API URL (e.g. `https://blogsphere-backend.onrender.com`).

### Step 3: Deploy Frontend to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/new) and import your GitHub repository.
2. Configure the project:
   - **Root Directory**: Select `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add **Environment Variable**:
   - `VITE_API_URL` = `https://blogsphere-backend.onrender.com/api`
4. Click **Deploy**. Vercel will automatically configure SPA routing using `frontend/vercel.json`.

---

## 🧪 Verification & Local Testing Executed

- **Backend Automated Test**: Executed `node test_api.js` verifying Mongo Atlas database connection, User registration, JWT creation/decoding, Post CRUD, Likes/Bookmarks schema, and Comment thread logic (100% pass).
- **Frontend Linter**: Executed `npm run lint` on React code (0 errors, 0 warnings).
- **Frontend Production Build**: Executed `npm run build` with Vite & Tailwind CSS v4 (100% successful build).

# BlogSphere — Premium Editorial Blogging Platform 🚀

BlogSphere is a full-stack publishing platform designed with editorial aesthetics, responsive user experience, robust REST APIs, and MongoDB data persistence.

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

### Backend `.env`
Create a `.env` file in the `backend/` directory based on `backend/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/BlogSphere?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

---

## 🚀 Quick Startup Instructions

### 1. Run the Backend Server
```bash
cd backend
npm install
npm run dev # Runs nodemon on http://localhost:5000
```

### 2. Run the Frontend Client
```bash
cd frontend
npm install
npm run dev # Runs Vite dev server on http://localhost:5173
```

---

## 📡 API Endpoint Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public (Rate-limited) |
| `POST` | `/api/auth/login` | Authenticate user & get JWT | Public (Rate-limited) |
| `GET` | `/api/auth/me` | Restore authenticated user profile | Private |
| `PUT` | `/api/auth/profile` | Update name, bio, avatar | Private |
| `GET` | `/api/auth/user/:id` | Fetch public author profile | Public |

### Articles (`/api/posts`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/posts` | Fetch articles with search, filter, sort & pagination | Public |
| `POST` | `/api/posts` | Create a new article or draft | Private |
| `GET` | `/api/posts/meta/categories` | Fetch category list & popular tags | Public |
| `GET` | `/api/posts/user/bookmarks` | Fetch user's bookmarked articles | Private |
| `GET` | `/api/posts/:id` | Fetch single article with author & related stories | Public |
| `PUT` | `/api/posts/:id` | Edit existing article | Private (Author only) |
| `DELETE` | `/api/posts/:id` | Delete article | Private (Author only) |
| `POST` | `/api/posts/:id/like` | Toggle like status on article | Private |
| `POST` | `/api/posts/:id/bookmark` | Toggle bookmark status on article | Private |

### Comments (`/api/comments`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/comments/:postId` | Fetch comments for an article | Public |
| `POST` | `/api/comments/:postId` | Submit a comment | Private |
| `DELETE` | `/api/comments/:id` | Delete comment | Private (Author or Post Owner) |

---

## 🧪 Verification & Testing Executed

- **Backend Automated Test**: Executed `node test_api.js` verifying Mongo Atlas database connection, User registration, JWT creation/decoding, Post CRUD, Likes/Bookmarks schema, and Comment thread logic (100% pass).
- **Frontend Linter**: Executed `npm run lint` on React code (0 errors, 0 warnings).
- **Frontend Production Build**: Executed `npm run build` with Vite & Tailwind CSS v4 (100% successful build).

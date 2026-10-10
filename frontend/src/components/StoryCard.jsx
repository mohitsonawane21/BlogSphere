import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Bookmark, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

export const StoryCard = ({ story, onBookmarkToggle, onLikeToggle }) => {
  const { user, isAuthenticated, isBookmarked, toggleUserBookmark } = useAuth();
  const navigate = useNavigate();

  const initialLikesCount = Array.isArray(story.likes) ? story.likes.length : 0;
  const initialIsLiked = Array.isArray(story.likes) && user ? story.likes.includes(user.id) : false;

  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [bookmarked, setBookmarked] = useState(isBookmarked(story._id));
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const formattedDate = story.createdAt
    ? new Date(story.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  const authorName = story.author?.name || "Anonymous Author";
  const category = story.category || "General";
  const readTime = story.readTime || 3;
  const coverImage = story.coverImage || "";

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (likeLoading) return;
    setLikeLoading(true);

    try {
      const res = await API.post(`/posts/${story._id}/like`);
      if (res.data.success) {
        setLikesCount(res.data.likesCount);
        setIsLiked(res.data.isLiked);
        if (onLikeToggle) onLikeToggle(story._id, res.data.isLiked, res.data.likesCount);
      }
    } catch (err) {
      console.error("Failed to like article", err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (bookmarkLoading) return;
    setBookmarkLoading(true);

    try {
      const res = await API.post(`/posts/${story._id}/bookmark`);
      if (res.data.success) {
        const nextState = res.data.isBookmarked;
        setBookmarked(nextState);
        toggleUserBookmark(story._id, nextState);
        if (onBookmarkToggle) onBookmarkToggle(story._id, nextState);
      }
    } catch (err) {
      console.error("Failed to bookmark article", err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Cover Image or Category Backdrop */}
        <Link to={`/post/${story._id}`} className="block overflow-hidden relative aspect-[16/9] bg-slate-100">
          {coverImage ? (
            <img
              src={coverImage}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-50 via-slate-50 to-amber-50 flex items-center justify-center p-6 text-slate-300 font-serif italic text-2xl group-hover:scale-105 transition-transform duration-500 select-none">
              BlogSphere Editorial
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-white/95 backdrop-blur-sm rounded-full shadow-sm">
              {category}
            </span>
            {story.status === "draft" && (
              <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-100/95 backdrop-blur-sm rounded-full shadow-sm">
                Draft
              </span>
            )}
          </div>
        </Link>

        {/* Card Body */}
        <div className="p-6">
          <Link to={`/post/${story._id}`} className="block group-hover:text-indigo-600 transition-colors">
            <h3 className="font-serif text-xl font-bold text-slate-900 tracking-tight leading-snug line-clamp-2 mb-2">
              {story.title}
            </h3>
          </Link>

          <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed mb-4">
            {story.excerpt || story.content?.replace(/[#*`_]/g, "").substring(0, 140) + "..."}
          </p>

          {/* Tags */}
          {Array.isArray(story.tags) && story.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {story.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5 min-w-0">
          {story.author?.avatar ? (
            <img
              src={story.author.avatar}
              alt={authorName}
              className="w-7 h-7 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
              {authorName.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{authorName}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span>{formattedDate}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <Clock className="w-3 h-3" /> {readTime} min read
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className={`p-2 rounded-full transition-all flex items-center gap-1 text-xs ${
              isLiked
                ? "text-rose-600 bg-rose-50"
                : "text-slate-400 hover:text-rose-500 hover:bg-slate-100"
            }`}
            title={isLiked ? "Unlike story" : "Like story"}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current text-rose-600" : ""}`} />
            {likesCount > 0 && <span className="font-medium text-slate-600">{likesCount}</span>}
          </button>

          <button
            onClick={handleBookmark}
            disabled={bookmarkLoading}
            className={`p-2 rounded-full transition-all ${
              bookmarked
                ? "text-indigo-600 bg-indigo-50"
                : "text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
            }`}
            title={bookmarked ? "Remove bookmark" : "Save article"}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current text-indigo-600" : ""}`} />
          </button>
        </div>
      </div>
    </article>
  );
};

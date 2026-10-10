import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Bookmark,
  Clock,
  Calendar,
  ArrowLeft,
  Edit,
  Trash2,
  MessageSquare,
  Share2,
  Send,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { StoryCard } from "../components/StoryCard";
import { Toast } from "../components/Toast";
import API from "../api/axios";

export const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isBookmarked, toggleUserBookmark } = useAuth();

  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const [loading, setLoading] = useState(true);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "info" });

  useEffect(() => {
    let isMounted = true;
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const [postRes, commentsRes] = await Promise.all([
          API.get(`/posts/${id}`),
          API.get(`/comments/${id}`),
        ]);

        if (isMounted) {
          if (postRes.data.success) {
            const p = postRes.data.post;
            setPost(p);
            setRelatedPosts(postRes.data.relatedPosts || []);
            setLikesCount(Array.isArray(p.likes) ? p.likes.length : 0);
            setIsLiked(Array.isArray(p.likes) && user ? p.likes.includes(user.id) : false);
            setBookmarked(isBookmarked(p._id));
          }

          if (commentsRes.data.success) {
            setComments(commentsRes.data.comments || []);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load article:", err);
          setError(err.response?.data?.message || "Article not found or server error");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchArticle();
    return () => {
      isMounted = false;
    };
  }, [id, user, isBookmarked]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const res = await API.post(`/posts/${id}/like`);
      if (res.data.success) {
        setLikesCount(res.data.likesCount);
        setIsLiked(res.data.isLiked);
      }
    } catch {
      setToast({ message: "Failed to like article", type: "error" });
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const res = await API.post(`/posts/${id}/bookmark`);
      if (res.data.success) {
        const nextState = res.data.isBookmarked;
        setBookmarked(nextState);
        toggleUserBookmark(post._id, nextState);
        setToast({
          message: nextState ? "Article saved to bookmarks" : "Article removed from bookmarks",
          type: "success",
        });
      }
    } catch {
      setToast({ message: "Failed to update bookmark", type: "error" });
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
      return;
    }
    try {
      const res = await API.delete(`/posts/${id}`);
      if (res.data.success) {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to delete article", type: "error" });
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!newComment.trim()) return;

    setCommentSubmitting(true);
    try {
      const res = await API.post(`/comments/${id}`, { text: newComment.trim() });
      if (res.data.success) {
        setComments([res.data.comment, ...comments]);
        setNewComment("");
        setToast({ message: "Comment added successfully", type: "success" });
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to add comment", type: "error" });
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const res = await API.delete(`/comments/${commentId}`);
      if (res.data.success) {
        setComments(comments.filter((c) => c._id !== commentId));
        setToast({ message: "Comment removed", type: "info" });
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to delete comment", type: "error" });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setToast({ message: "Link copied to clipboard!", type: "info" });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse">
        <div className="w-24 h-6 bg-slate-200 rounded-md mb-6" />
        <div className="w-3/4 h-10 bg-slate-200 rounded-lg mb-4" />
        <div className="w-full h-96 bg-slate-200 rounded-2xl mb-8" />
        <div className="space-y-4">
          <div className="w-full h-4 bg-slate-100 rounded" />
          <div className="w-5/6 h-4 bg-slate-100 rounded" />
          <div className="w-4/6 h-4 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-bold text-slate-900 mb-2">Article Not Found</h2>
        <p className="text-slate-600 text-sm mb-6">{error || "The requested article could not be loaded."}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const isAuthor = user && post.author && (user.id === post.author._id || user.id === post.author);
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="min-h-screen bg-slate-50/40 py-10 pb-20">
      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ message: "", type: "info" })} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Top Back Link & Author Controls */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </Link>

          {isAuthor && (
            <div className="flex items-center gap-2">
              <Link
                to={`/edit/${post._id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium text-xs transition-colors"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Article
              </Link>
              <button
                onClick={handleDeletePost}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 rounded-full border border-indigo-100">
              {post.category || "General"}
            </span>
            {post.status === "draft" && (
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-100 rounded-full">
                Draft Preview
              </span>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18] mb-6">
            {post.title}
          </h1>

          {/* Author info & Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200/80">
            <div className="flex items-center gap-3">
              {post.author?.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-lg">
                  {post.author?.name ? post.author.name.charAt(0) : "A"}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-slate-900">{post.author?.name || "Anonymous Author"}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {formattedDate}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {post.readTime || 3} min read
                  </span>
                </div>
              </div>
            </div>

            {/* Social & Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  isLiked
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current text-rose-600" : ""}`} />
                <span>{likesCount}</span>
              </button>

              <button
                onClick={handleBookmark}
                className={`p-2 rounded-full border transition-all ${
                  bookmarked
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                title="Save Article"
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current text-indigo-600" : ""}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                title="Share Article"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Article Cover Image */}
        {post.coverImage && (
          <div className="mb-10 rounded-2xl overflow-hidden aspect-[16/9] shadow-sm bg-slate-100">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Article Content Body */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm mb-12">
          <div className="prose prose-slate prose-lg max-w-none leading-relaxed text-slate-800 font-sans whitespace-pre-wrap">
            {post.content}
          </div>

          {/* Tags List */}
          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap gap-2">
              {post.tags.map((tag, idx) => (
                <Link
                  key={idx}
                  to={`/explore?tag=${encodeURIComponent(tag)}`}
                  className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-3 py-1 rounded-full transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Author Bio Box */}
        {post.author && (
          <div className="bg-gradient-to-r from-indigo-50/60 to-slate-50 rounded-2xl border border-indigo-100/80 p-6 mb-12 flex items-start gap-4">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xl flex-shrink-0">
                {post.author.name ? post.author.name.charAt(0) : "A"}
              </div>
            )}
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 mb-1">{post.author.name}</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-2">
                {post.author.bio || "Writer & contributor at BlogSphere."}
              </p>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-sm mb-12">
          <div className="flex items-center gap-2 mb-8">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h3 className="font-serif text-2xl font-bold text-slate-900">
              Discussion ({comments.length})
            </h3>
          </div>

          {/* Add Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="mb-10">
              <textarea
                rows={3}
                placeholder="Share your thoughts or feedback on this article..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
                className="w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-900 mb-3"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={commentSubmitting || !newComment.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xs"
                >
                  <Send className="w-4 h-4" /> Post Comment
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-6 text-center mb-8 border border-slate-200/60">
              <p className="text-slate-600 text-sm mb-3">Please log in to participate in the article discussion.</p>
              <Link
                to="/login"
                className="inline-block px-5 py-2 bg-slate-900 text-white font-medium text-xs rounded-xl hover:bg-slate-800"
              >
                Log In to Comment
              </Link>
            </div>
          )}

          {/* Comments List */}
          {comments.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-6">No comments yet. Start the conversation!</p>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => {
                const canDelete =
                  user && (user.id === comment.author?._id || user.id === comment.author || isAuthor);
                return (
                  <div key={comment._id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {comment.author?.avatar ? (
                        <img
                          src={comment.author.avatar}
                          alt={comment.author.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {comment.author?.name ? comment.author.name.charAt(0) : "U"}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-900">{comment.author?.name || "User"}</span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{comment.text}</p>
                      </div>
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                        title="Delete Comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Related Stories */}
        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <h3 className="font-serif text-2xl font-bold text-slate-900 mb-6">More in {post.category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rel) => (
                <StoryCard key={rel._id} story={rel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
};

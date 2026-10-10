import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PenSquare, Eye, Save, ArrowLeft, Image as ImageIcon, Tag, Folder } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Toast } from "../components/Toast";
import API from "../api/axios";

export const CreateEditArticle = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Technology");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("published");

  const [activeTab, setActiveTab] = useState("write"); // 'write' | 'preview'
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    let isMounted = true;
    if (isEditMode) {
      const fetchArticleToEdit = async () => {
        try {
          const res = await API.get(`/posts/${id}`);
          if (res.data.success && isMounted) {
            const p = res.data.post;
            if (user && p.author && p.author._id !== user.id && p.author !== user.id) {
              setToast({ message: "You are not authorized to edit this article", type: "error" });
              navigate("/");
              return;
            }
            setTitle(p.title || "");
            setExcerpt(p.excerpt || "");
            setCategory(p.category || "Technology");
            setTags(Array.isArray(p.tags) ? p.tags.join(", ") : "");
            setCoverImage(p.coverImage || "");
            setContent(p.content || "");
            setStatus(p.status || "published");
          }
        } catch {
          if (isMounted) {
            setToast({ message: "Failed to load article for editing", type: "error" });
            navigate("/");
          }
        } finally {
          if (isMounted) setLoading(false);
        }
      };
      fetchArticleToEdit();
    }

    return () => {
      isMounted = false;
    };
  }, [id, isEditMode, isAuthenticated, navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setToast({ message: "Title and content body are required.", type: "error" });
      return;
    }

    setSubmitting(true);
    const payload = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      category: category.trim(),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      coverImage: coverImage.trim(),
      content: content.trim(),
      status,
    };

    try {
      if (isEditMode) {
        const res = await API.put(`/posts/${id}`, payload);
        if (res.data.success) {
          setToast({ message: "Article updated successfully!", type: "success" });
          setTimeout(() => navigate(`/post/${id}`), 1000);
        }
      } else {
        const res = await API.post("/posts", payload);
        if (res.data.success) {
          setToast({ message: "Article published successfully!", type: "success" });
          setTimeout(() => navigate(`/post/${res.data.post._id}`), 1000);
        }
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to save article", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="w-48 h-8 bg-slate-200 rounded mx-auto mb-4" />
        <div className="w-full h-64 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 pb-20">
      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ message: "", type: "info" })} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            {/* Tab Switcher */}
            <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("write")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === "write" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <PenSquare className="w-3.5 h-3.5" /> Write
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === "preview" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
            </div>
          </div>
        </div>

        {/* Editor Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-6">
            <h1 className="font-serif text-3xl font-extrabold text-slate-900 mb-2">
              {isEditMode ? "Edit Story" : "Draft a New Story"}
            </h1>
            <p className="text-slate-500 text-sm">
              Share your insights, tutorials, or stories with the BlogSphere reader network.
            </p>
          </div>

          {activeTab === "write" ? (
            <>
              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Story Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Building Resilient Microservices with Node.js & React"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full text-xl font-serif font-bold p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-900"
                />
              </div>

              {/* Excerpt Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Short Excerpt / Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="A concise 1-2 sentence overview of your article..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full text-sm p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-800"
                />
              </div>

              {/* Category, Tags, Status Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                    <Folder className="w-3.5 h-3.5 text-indigo-600" /> Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 font-medium text-slate-800"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design & UX</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Culture">Culture</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-indigo-600" /> Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="react, webdev, systemdesign"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Publishing Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 font-medium text-slate-800"
                  >
                    <option value="published">Published (Public)</option>
                    <option value="draft">Draft (Private)</option>
                  </select>
                </div>
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-600" /> Cover Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 text-slate-800"
                />
              </div>

              {/* Main Content Body */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Article Body *
                </label>
                <textarea
                  rows={14}
                  placeholder="Write your article content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="w-full p-4 text-base font-sans leading-relaxed bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-900"
                />
              </div>
            </>
          ) : (
            /* Live Preview Mode */
            <div className="space-y-6">
              <span className="px-3 py-1 text-xs font-bold uppercase text-indigo-700 bg-indigo-50 rounded-full">
                {category}
              </span>
              <h1 className="font-serif text-3xl font-extrabold text-slate-900">{title || "Untitled Story"}</h1>
              {coverImage && (
                <div className="rounded-2xl overflow-hidden aspect-[16/9]">
                  <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="prose prose-slate max-w-none whitespace-pre-wrap leading-relaxed text-slate-800">
                {content || "No content written yet."}
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-slate-600 hover:text-slate-900 font-medium text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              className="inline-flex items-center gap-2 px-7 py-3 bg-indigo-600 text-white font-medium text-sm rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm"
            >
              <Save className="w-4 h-4" />
              {submitting ? "Saving..." : isEditMode ? "Update Article" : status === "draft" ? "Save Draft" : "Publish Article"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

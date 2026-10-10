import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Calendar, BookOpen, Bookmark, Edit3, Save, PenSquare, FileText, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { StoryCard } from "../components/StoryCard";
import { StorySkeleton } from "../components/StorySkeleton";
import { Toast } from "../components/Toast";
import API from "../api/axios";

export const Profile = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("my-posts"); // 'my-posts' | 'drafts' | 'bookmarks'
  const [myPosts, setMyPosts] = useState([]);
  const [draftPosts, setDraftPosts] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(user?.name || "");
  const [editBio, setEditBio] = useState(user?.bio || "");
  const [editAvatar, setEditAvatar] = useState(user?.avatar || "");
  const [updating, setUpdating] = useState(false);

  const [toast, setToast] = useState({ message: "", type: "info" });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    let isMounted = true;
    const userId = user?.id;

    const fetchUserData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [myPostsRes, draftsRes, bookmarksRes] = await Promise.all([
          API.get(`/posts?author=${userId}&status=published`),
          API.get(`/posts?author=${userId}&status=draft`),
          API.get("/posts/user/bookmarks"),
        ]);

        if (isMounted) {
          if (myPostsRes.data.success) {
            setMyPosts(myPostsRes.data.posts || []);
          }
          if (draftsRes.data.success) {
            setDraftPosts(draftsRes.data.posts || []);
          }
          if (bookmarksRes.data.success) {
            setBookmarks(bookmarksRes.data.bookmarks || []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.id, navigate]);

  const toggleEditProfile = () => {
    if (!isEditingProfile && user) {
      setEditName(user.name || "");
      setEditBio(user.bio || "");
      setEditAvatar(user.avatar || "");
    }
    setIsEditingProfile(!isEditingProfile);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      setToast({ message: "Name cannot be empty", type: "error" });
      return;
    }

    setUpdating(true);
    try {
      await updateProfile({
        name: editName.trim(),
        bio: editBio.trim(),
        avatar: editAvatar.trim(),
      });
      setIsEditingProfile(false);
      setToast({ message: "Profile updated successfully!", type: "success" });
    } catch (err) {
      setToast({ message: err.message || "Failed to update profile", type: "error" });
    } finally {
      setUpdating(false);
    }
  };

  if (!user) return null;

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Member";

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 pb-20">
      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ message: "", type: "info" })} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Profile Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm mb-10 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md flex-shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-indigo-600 text-white font-bold text-3xl flex items-center justify-center shadow-md flex-shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}

              <div>
                <h1 className="font-serif text-3xl font-extrabold text-slate-900 mb-1">{user.name}</h1>
                <p className="text-slate-500 text-sm mb-3 flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-4 h-4 text-slate-400" /> {user.email}
                  <span>•</span>
                  <Calendar className="w-4 h-4 text-slate-400" /> Joined {formattedDate}
                </p>
                <p className="text-slate-700 text-sm max-w-xl leading-relaxed">
                  {user.bio || "No biography provided yet. Edit your profile to introduce yourself to readers."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleEditProfile}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-all shadow-xs"
              >
                <Edit3 className="w-4 h-4 text-indigo-600" /> Edit Profile
              </button>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-sm"
              >
                <PenSquare className="w-4 h-4" /> New Article
              </Link>
            </div>
          </div>

          {/* Edit Profile Panel */}
          {isEditingProfile && (
            <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50/80 -mx-8 -mb-8 p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-bold text-slate-900">Update Profile Details</h3>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Avatar Image URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Short Bio</label>
                  <textarea
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    maxLength={250}
                    className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 text-white font-medium text-xs rounded-xl hover:bg-indigo-700"
                  >
                    <Save className="w-3.5 h-3.5" /> {updating ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 border-b border-slate-200 mb-8">
          <button
            onClick={() => setActiveTab("my-posts")}
            className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "my-posts"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Published Articles ({myPosts.length})
          </button>

          <button
            onClick={() => setActiveTab("drafts")}
            className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "drafts"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" /> Drafts ({draftPosts.length})
          </button>

          <button
            onClick={() => setActiveTab("bookmarks")}
            className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "bookmarks"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Bookmark className="w-4 h-4" /> Saved Bookmarks ({bookmarks.length})
          </button>
        </div>

        {/* Tab Contents */}
        {loading ? (
          <StorySkeleton count={3} />
        ) : (
          <>
            {activeTab === "my-posts" && (
              myPosts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="font-serif text-xl font-bold text-slate-900 mb-1">No Published Articles Yet</h3>
                  <p className="text-slate-500 text-sm mb-4">Share your knowledge and write your first article.</p>
                  <Link
                    to="/create"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm"
                  >
                    <PenSquare className="w-4 h-4" /> Write Article
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {myPosts.map((post) => (
                    <StoryCard key={post._id} story={post} />
                  ))}
                </div>
              )
            )}

            {activeTab === "drafts" && (
              draftPosts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="font-serif text-xl font-bold text-slate-900 mb-1">No Drafts Saved</h3>
                  <p className="text-slate-500 text-sm">You have no unpublished article drafts.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {draftPosts.map((post) => (
                    <StoryCard key={post._id} story={post} />
                  ))}
                </div>
              )
            )}

            {activeTab === "bookmarks" && (
              bookmarks.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
                  <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="font-serif text-xl font-bold text-slate-900 mb-1">No Saved Articles</h3>
                  <p className="text-slate-500 text-sm mb-4">
                    Explore stories and click the bookmark icon to save articles for later reading.
                  </p>
                  <Link
                    to="/explore"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-sm"
                  >
                    Explore Articles
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {bookmarks.map((post) => (
                    <StoryCard
                      key={post._id}
                      story={post}
                      onBookmarkToggle={(id, isBookmarkedNow) => {
                        if (!isBookmarkedNow) {
                          setBookmarks(bookmarks.filter((b) => b._id !== id));
                        }
                      }}
                    />
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

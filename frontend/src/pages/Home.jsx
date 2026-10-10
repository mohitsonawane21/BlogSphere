import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, TrendingUp, PenSquare, RefreshCw } from "lucide-react";
import { StoryCard } from "../components/StoryCard";
import { StorySkeleton } from "../components/StorySkeleton";
import API from "../api/axios";

export const Home = () => {
  const [featuredPost, setFeaturedPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [postsRes, metaRes] = await Promise.all([
        API.get("/posts?limit=7&sort=newest"),
        API.get("/posts/meta/categories"),
      ]);

      if (postsRes.data.success) {
        const allPosts = postsRes.data.posts || [];
        if (allPosts.length > 0) {
          setFeaturedPost(allPosts[0]);
          setRecentPosts(allPosts.slice(1));
        } else {
          setFeaturedPost(null);
          setRecentPosts([]);
        }
      }

      if (metaRes.data.success) {
        setCategories(metaRes.data.categories || []);
      }
    } catch (err) {
      console.error("Error fetching homepage stories:", err);
      setError("Failed to load stories. Please verify backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const [postsRes, metaRes] = await Promise.all([
          API.get("/posts?limit=7&sort=newest"),
          API.get("/posts/meta/categories"),
        ]);

        if (isMounted) {
          if (postsRes.data.success) {
            const allPosts = postsRes.data.posts || [];
            if (allPosts.length > 0) {
              setFeaturedPost(allPosts[0]);
              setRecentPosts(allPosts.slice(1));
            } else {
              setFeaturedPost(null);
              setRecentPosts([]);
            }
          }
          if (metaRes.data.success) {
            setCategories(metaRes.data.categories || []);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching homepage stories:", err);
          setError("Failed to load stories. Please verify backend connection.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-indigo-50/30 to-slate-50/50 border-b border-slate-200/60 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" /> Welcome to BlogSphere
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Where Great Ideas Find Their Signature Voice.
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed mb-8 max-w-2xl mx-auto">
              Discover deeply researched essays, engineering breakthroughs, and editorial perspectives curated by top creators.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/explore"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all shadow-sm"
              >
                Explore Stories <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/create"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-all shadow-xs"
              >
                <PenSquare className="w-4 h-4 text-indigo-600" /> Start Writing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap px-2">
            Categories:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/explore")}
              className="px-4 py-1.5 text-xs font-semibold rounded-full bg-slate-900 text-white shadow-xs whitespace-nowrap"
            >
              All Topics
            </button>
            {categories.length > 0
              ? categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(`/explore?category=${encodeURIComponent(cat.name)}`)}
                    className="px-4 py-1.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors whitespace-nowrap"
                  >
                    {cat.name} ({cat.count})
                  </button>
                ))
              : ["Technology", "Design", "Engineering", "Productivity", "Culture"].map((catName, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(`/explore?category=${catName}`)}
                    className="px-4 py-1.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors whitespace-nowrap"
                  >
                    {catName}
                  </button>
                ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {loading ? (
          <StorySkeleton count={6} />
        ) : error ? (
          <div className="bg-white border border-rose-200 rounded-2xl p-12 text-center max-w-lg mx-auto my-12">
            <p className="text-rose-600 font-medium mb-4">{error}</p>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Retry Loading
            </button>
          </div>
        ) : !featuredPost && recentPosts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center max-w-lg mx-auto my-12 shadow-sm">
            <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <h3 className="font-serif text-2xl font-bold text-slate-900 mb-2">No Articles Published Yet</h3>
            <p className="text-slate-500 text-sm mb-6">
              Be the first author to publish a story on BlogSphere and ignite the conversation.
            </p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all shadow-sm"
            >
              <PenSquare className="w-4 h-4" /> Write First Article
            </Link>
          </div>
        ) : (
          <>
            {/* Featured Article Spotlight */}
            {featuredPost && (
              <section className="mb-14">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <h2 className="font-serif text-2xl font-bold text-slate-900">Featured Article</h2>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md transition-all group grid grid-cols-1 lg:grid-cols-12">
                  <div className="lg:col-span-7 aspect-[16/10] bg-slate-100 relative overflow-hidden">
                    {featuredPost.coverImage ? (
                      <img
                        src={featuredPost.coverImage}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-100 via-slate-100 to-amber-100 flex items-center justify-center p-8 text-slate-400 font-serif italic text-3xl">
                        Featured Editorial
                      </div>
                    )}
                    <span className="absolute top-4 left-4 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-white/95 rounded-full shadow-sm">
                      {featuredPost.category || "General"}
                    </span>
                  </div>

                  <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between">
                    <div>
                      <Link to={`/post/${featuredPost._id}`}>
                        <h3 className="font-serif text-2xl lg:text-3xl font-bold text-slate-900 leading-tight mb-4 group-hover:text-indigo-600 transition-colors">
                          {featuredPost.title}
                        </h3>
                      </Link>
                      <p className="text-slate-600 text-base leading-relaxed mb-6 line-clamp-4">
                        {featuredPost.excerpt || featuredPost.content?.substring(0, 180) + "..."}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                          {featuredPost.author?.name ? featuredPost.author.name.charAt(0) : "A"}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{featuredPost.author?.name || "Author"}</p>
                          <p className="text-[11px] text-slate-400">{featuredPost.readTime || 3} min read</p>
                        </div>
                      </div>

                      <Link
                        to={`/post/${featuredPost._id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        Read Full Story <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Recent Stories Grid */}
            {recentPosts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-serif text-2xl font-bold text-slate-900">Recent Stories</h2>
                  <Link
                    to="/explore"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    View All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recentPosts.map((post) => (
                    <StoryCard key={post._id} story={post} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Tag, RefreshCw, X } from "lucide-react";
import { StoryCard } from "../components/StoryCard";
import { StorySkeleton } from "../components/StorySkeleton";
import { Pagination } from "../components/Pagination";
import API from "../api/axios";

export const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchFromUrl = searchParams.get("search") || "";
  const categoryFromUrl = searchParams.get("category") || "All";
  const tagFromUrl = searchParams.get("tag") || "";
  const sortFromUrl = searchParams.get("sort") || "newest";
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);

  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalPosts: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchExploreData = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          page: pageFromUrl,
          limit: 9,
          sort: sortFromUrl,
        });

        if (searchFromUrl) queryParams.set("search", searchFromUrl);
        if (categoryFromUrl && categoryFromUrl !== "All") queryParams.set("category", categoryFromUrl);
        if (tagFromUrl) queryParams.set("tag", tagFromUrl);

        const [postsRes, metaRes] = await Promise.all([
          API.get(`/posts?${queryParams.toString()}`),
          API.get("/posts/meta/categories"),
        ]);

        if (isMounted) {
          if (postsRes.data.success) {
            setPosts(postsRes.data.posts || []);
            if (postsRes.data.pagination) {
              setPagination(postsRes.data.pagination);
            }
          }

          if (metaRes.data.success) {
            setCategories(metaRes.data.categories || []);
            setPopularTags(metaRes.data.popularTags || []);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to fetch explore data:", err);
          setError("Failed to load articles. Please check backend.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchExploreData();
    return () => {
      isMounted = false;
    };
  }, [searchFromUrl, categoryFromUrl, tagFromUrl, sortFromUrl, pageFromUrl]);

  const updateFilters = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === "" || val === "All" || (key === "page" && val === 1)) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim(), page: 1 });
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const hasActiveFilters = searchFromUrl || (categoryFromUrl && categoryFromUrl !== "All") || tagFromUrl;

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Explore Stories
          </h1>
          <p className="text-slate-600 text-base">
            Browse through articles, filter by topic, or search for specialized engineering insights.
          </p>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm mb-8 space-y-5">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search articles by title, content, or tag..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-900 text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 text-white font-medium text-sm rounded-xl hover:bg-slate-800 transition-colors shadow-xs"
            >
              Search
            </button>
          </form>

          {/* Categories & Sorting Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-slate-100">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              <button
                onClick={() => updateFilters({ category: "All", page: 1 })}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                  categoryFromUrl === "All"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Categories
              </button>

              {categories.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => updateFilters({ category: cat.name, page: 1 })}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
                    categoryFromUrl.toLowerCase() === cat.name.toLowerCase()
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-500">Sort by:</span>
              <select
                value={sortFromUrl}
                onChange={(e) => updateFilters({ sort: e.target.value, page: 1 })}
                className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Liked</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Active Tag Filter Indicator / Popular Tags */}
          {popularTags.length > 0 && (
            <div className="flex items-center gap-2 pt-2 text-xs flex-wrap">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Popular Tags:
              </span>
              {popularTags.map((t, i) => (
                <button
                  key={i}
                  onClick={() => updateFilters({ tag: t.name, page: 1 })}
                  className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                    tagFromUrl.toLowerCase() === t.name.toLowerCase()
                      ? "bg-indigo-100 text-indigo-700 font-semibold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  #{t.name}
                </button>
              ))}
            </div>
          )}

          {/* Active Filters Bar */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
              <span>Active filters:</span>
              {searchFromUrl && (
                <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium">
                  Search: "{searchFromUrl}"
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => updateFilters({ search: "", page: 1 })}
                  />
                </span>
              )}
              {categoryFromUrl && categoryFromUrl !== "All" && (
                <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium">
                  Category: {categoryFromUrl}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => updateFilters({ category: "All", page: 1 })}
                  />
                </span>
              )}
              {tagFromUrl && (
                <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium">
                  Tag: #{tagFromUrl}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => updateFilters({ tag: "", page: 1 })}
                  />
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-rose-600 font-semibold hover:underline ml-auto"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between text-sm text-slate-500">
          <span>
            Showing <strong className="text-slate-900">{posts.length}</strong> of{" "}
            <strong className="text-slate-900">{pagination.totalPosts}</strong> articles
          </span>
        </div>

        {/* Stories Grid */}
        {loading ? (
          <StorySkeleton count={6} />
        ) : error ? (
          <div className="bg-white border border-rose-200 rounded-2xl p-12 text-center max-w-lg mx-auto my-12">
            <p className="text-rose-600 font-medium mb-4">{error}</p>
            <button
              onClick={() => updateFilters({ page: 1 })}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center max-w-md mx-auto my-12 shadow-sm">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-serif text-2xl font-bold text-slate-900 mb-2">No Articles Found</h3>
            <p className="text-slate-500 text-sm mb-6">
              We couldn't find any articles matching your search criteria. Try adjusting your query or filters.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <StoryCard key={post._id} story={post} />
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => updateFilters({ page })}
            />
          </>
        )}
      </div>
    </div>
  );
};

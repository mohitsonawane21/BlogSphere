import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  PenSquare,
  Compass,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Search,
  Home,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-slate-900 font-serif text-2xl font-bold tracking-tight">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-sans text-lg font-bold flex items-center justify-center shadow-sm">
                B
              </span>
              BlogSphere
            </Link>

            {/* Quick Search Input */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search stories, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9 pr-4 py-1.5 text-sm bg-slate-100/80 border border-transparent rounded-full focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400 text-slate-800"
              />
            </form>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                isActive("/") ? "text-indigo-600 font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Home className="w-4 h-4" /> Home
            </Link>

            <Link
              to="/explore"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                isActive("/explore") ? "text-indigo-600 font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Compass className="w-4 h-4" /> Explore
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/create"
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  <PenSquare className="w-4 h-4 text-indigo-600" /> Write Story
                </Link>

                {/* User Menu */}
                <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 group hover:opacity-90 transition-opacity"
                    title="View Profile"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-300"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {user?.name}
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-all"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-sm transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </form>

          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              <Home className="w-5 h-5 text-indigo-600" /> Home
            </Link>
            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              <Compass className="w-5 h-5 text-indigo-600" /> Explore Stories
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  <PenSquare className="w-5 h-5 text-indigo-600" /> Write Article
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  <UserIcon className="w-5 h-5 text-indigo-600" /> My Profile & Bookmarks
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-base font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  <LogOut className="w-5 h-5" /> Logout ({user?.name})
                </button>
              </>
            ) : (
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
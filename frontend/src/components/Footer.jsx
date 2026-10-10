import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 text-white font-serif text-2xl font-bold tracking-tight mb-4">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-sans text-lg">
                B
              </span>
              BlogSphere
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              A modern, high-grade editorial publishing platform built for thoughtful writers, tech enthusiasts, and storytellers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home / Discover
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">
                  Explore Stories
                </Link>
              </li>
              <li>
                <Link to="/create" className="hover:text-white transition-colors">
                  Write Article
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  My Profile & Saved
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/explore?category=Technology" className="hover:text-white transition-colors">
                  Technology
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Design" className="hover:text-white transition-colors">
                  Design & UX
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Engineering" className="hover:text-white transition-colors">
                  Software Engineering
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Productivity" className="hover:text-white transition-colors">
                  Productivity
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} BlogSphere. Crafted with precision for editorial excellence.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> React & Express
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

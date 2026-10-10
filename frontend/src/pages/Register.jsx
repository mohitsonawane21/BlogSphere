import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Image as ImageIcon, FileText, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Name, email, and password are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, avatar, bio);
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2 text-slate-900 font-serif text-3xl font-bold tracking-tight">
            <span className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-sans text-xl font-bold flex items-center justify-center shadow-sm">
              B
            </span>
            BlogSphere
          </Link>
        </div>
        <h2 className="mt-6 text-center font-serif text-3xl font-extrabold text-slate-900 tracking-tight">
          Join BlogSphere Today
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Create an account to publish articles, save bookmarks, and join discussions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm rounded-3xl border border-slate-200/90">
          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Mohit Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-900 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  placeholder="mohit@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-900 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Password (Min 6 characters) *
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-11 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-900 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Avatar Image URL (Optional)
              </label>
              <div className="relative">
                <ImageIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 text-slate-900 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Short Bio (Optional)
              </label>
              <div className="relative">
                <FileText className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <textarea
                  rows={2}
                  placeholder="Software engineer, writer, and tech enthusiast..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 text-slate-900 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 text-white font-medium text-sm rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2 mt-4"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
                Log In Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

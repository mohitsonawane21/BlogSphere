import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import { Footer } from "./components/Footer";

// Pages
import { Home } from "./pages/Home";
import { Explore } from "./pages/Explore";
import { ArticleDetail } from "./pages/ArticleDetail";
import { CreateEditArticle } from "./pages/CreateEditArticle";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Profile } from "./pages/Profile";

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="font-serif text-6xl font-extrabold text-slate-900 mb-4">404</h1>
      <h2 className="font-serif text-2xl font-bold text-slate-800 mb-2">Page Not Found</h2>
      <p className="text-slate-600 mb-6 max-w-sm">The page you are looking for doesn't exist or has been moved.</p>
      <Link
        to="/"
        className="px-6 py-3 bg-slate-900 text-white font-medium text-sm rounded-xl hover:bg-slate-800 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
          <Navbar />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/post/:id" element={<ArticleDetail />} />
              <Route path="/create" element={<CreateEditArticle />} />
              <Route path="/edit/:id" element={<CreateEditArticle />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
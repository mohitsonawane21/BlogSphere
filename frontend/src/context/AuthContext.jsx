import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("blogsphere_token");
    localStorage.removeItem("blogsphere_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  // Restore authenticated session on initial render
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem("blogsphere_token") || localStorage.getItem("token");
      const storedUser = localStorage.getItem("blogsphere_user") || localStorage.getItem("user");

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error("Failed to parse stored user", e);
          }
        }
        // Fetch fresh user profile from backend
        try {
          const res = await API.get("/auth/me");
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem("blogsphere_user", JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn("Session token expired or invalid:", err.response?.data?.message);
          logout();
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, [logout]);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem("blogsphere_token", newToken);
      localStorage.setItem("blogsphere_user", JSON.stringify(newUser));
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));
      return res.data;
    }
    throw new Error(res.data.message || "Login failed");
  };

  const register = async (name, email, password, avatar = "", bio = "") => {
    const res = await API.post("/auth/register", { name, email, password, avatar, bio });
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem("blogsphere_token", newToken);
      localStorage.setItem("blogsphere_user", JSON.stringify(newUser));
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));
      return res.data;
    }
    throw new Error(res.data.message || "Registration failed");
  };

  const updateProfile = async (profileData) => {
    const res = await API.put("/auth/profile", profileData);
    if (res.data.success) {
      setUser(res.data.user);
      localStorage.setItem("blogsphere_user", JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data.message || "Profile update failed");
  };

  const isBookmarked = (postId) => {
    if (!user || !user.bookmarks) return false;
    return user.bookmarks.some((bm) => (typeof bm === "string" ? bm === postId : bm._id === postId));
  };

  const toggleUserBookmark = (postId, isBookmarkedNow) => {
    if (!user) return;
    let updatedBookmarks = [...(user.bookmarks || [])];
    if (isBookmarkedNow) {
      if (!updatedBookmarks.includes(postId)) {
        updatedBookmarks.push(postId);
      }
    } else {
      updatedBookmarks = updatedBookmarks.filter((bm) => (typeof bm === "string" ? bm !== postId : bm._id !== postId));
    }
    const updatedUser = { ...user, bookmarks: updatedBookmarks };
    setUser(updatedUser);
    localStorage.setItem("blogsphere_user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isBookmarked,
        toggleUserBookmark,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

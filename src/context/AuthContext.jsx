import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in and token is valid on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const tokenExpires = localStorage.getItem("tokenExpires");

    if (storedUser && token) {
      // Check if token has expired
      if (tokenExpires) {
        const expirationDate = new Date(tokenExpires);
        const now = new Date();

        if (now >= expirationDate) {
          // Token has expired, clear everything
          console.log("Token has expired, logging out");
          logout();
          setLoading(false);
          return;
        }
      }

      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (userData, token, tokenExpires = null) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);

    if (tokenExpires) {
      localStorage.setItem("tokenExpires", tokenExpires);
    }

    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpires");
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    localStorage.setItem("user", JSON.stringify(newUserData));
    setUser(newUserData);
  };

  const isTokenExpired = () => {
    const tokenExpires = localStorage.getItem("tokenExpires");
    if (!tokenExpires) return false;

    const expirationDate = new Date(tokenExpires);
    const now = new Date();
    return now >= expirationDate;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    isTokenExpired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import React, { createContext, useState, useEffect } from "react";
import { Storage } from "../services/storage";
import { authService, setCustomBaseUrl } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverUrl, setServerUrl] = useState("https://tms-047i.onrender.com/api");

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      setLoading(true);
      const savedUrl = await Storage.getItem("server_url");
      if (savedUrl) {
        setServerUrl(savedUrl);
        setCustomBaseUrl(savedUrl);
      }

      const storedToken = await Storage.getItem("token");
      const storedUser = await Storage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        try {
          const res = await authService.getProfile();
          setUser(res.data.user);
          await Storage.setItem("user", JSON.stringify(res.data.user));
        } catch (e) {
          console.warn("Token validation failed on launch", e?.message);
        }
      }
    } catch (error) {
      console.error("Error loading auth state", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { token: newToken, user: userData } = response.data;

      setToken(newToken);
      setUser(userData);

      await Storage.setItem("token", newToken);
      await Storage.setItem("user", JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed. Please check credentials or network.";
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      setToken(null);
      setUser(null);
      await Storage.removeItem("token");
      await Storage.removeItem("user");
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  const updateServerUrl = async (newUrl) => {
    try {
      setServerUrl(newUrl);
      setCustomBaseUrl(newUrl);
      await Storage.setItem("server_url", newUrl);
    } catch (e) {
      console.error("Failed to update server url", e);
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await authService.getProfile();
      setUser(res.data.user);
      await Storage.setItem("user", JSON.stringify(res.data.user));
      return res.data.user;
    } catch (error) {
      console.error("Error refreshing profile", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        refreshProfile,
        serverUrl,
        updateServerUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

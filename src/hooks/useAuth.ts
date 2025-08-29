"use client";

import { useState, useEffect, createContext, useContext } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  subscription: string;
  subscriptionEndsAt?: string;
  role: string;
  whatsapp?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser?: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      console.log("Checking auth status...");
      const response = await fetch("/api/auth/me", {
        credentials: "include", // Ensure cookies are sent
      });
      
      console.log("Auth response status:", response.status);
      
      if (!response.ok) {
        console.log("Auth response not ok");
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();
      console.log("Auth data received:", data);
      setUser(data.user);
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("🔐 Starting login attempt for:", email);
      console.log("🔐 Password provided:", password ? "Yes" : "No");
      console.log("🔐 Making request to /api/auth/simple-login");
      
      const response = await fetch("/api/auth/simple-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Ensure cookies are included
      });

      console.log("🔐 Login response status:", response.status);
      console.log("🔐 Login response headers:", Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log("🔐 Login response data:", data);

      if (response.ok) {
        console.log("✅ Login successful, user data:", data.user);
        setUser(data.user);
        // Force refresh auth state to ensure consistency
        await checkAuth();
        return true;
      } else {
        console.error("❌ Login failed with status:", response.status, "error:", data.error);
        console.error("❌ Full response data:", data);
        throw new Error(data.error || "Login failed");
      }
    } catch (error) {
      console.error("💥 Login error:", error);
      if (error instanceof TypeError) {
        console.error("💥 Network error - check if server is running");
      }
      throw error; // Re-throw so the component can handle it
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: "include", // Ensure cookies are included
      });
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  const updateUser = (newUser: User) => {
    setUser(newUser);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    user,
    isLoading,
    login,
    logout,
    refreshUser,
    updateUser,
  };
};
import React, { createContext, useContext, useState, useEffect } from "react";

import {
  login as apiLogin,
  validateToken as apiValidateToken,
} from "@/api/auth";

import type { AuthState, User } from "@/types";

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(() => {
    return !!localStorage.getItem("auth-token");
  });

  const isAuthenticated = user !== null;

  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (!token) return;

    apiValidateToken(token)
      .then((user) => {
        if (user) setUser(user);
        else localStorage.removeItem("auth-token");
      })
      .catch(() => localStorage.removeItem("auth-token"))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const { token, user } = await apiLogin(username, password);
    localStorage.setItem("auth-token", token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("auth-token");
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect } from "react";

import {
  login as apiLogin,
  validateToken as apiValidateToken,
} from "@/api/auth";

import type { AuthState, User } from "@/types";

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // checks if the user is authenticated
  const isAuthenticated = user !== null;

  // checks for token existance and validates if it exists
  // early return otherwise
  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (!token) return;

    apiValidateToken(token)
      .then((user) => {
        if (user) setUser(user);
        else localStorage.removeItem("auth-token");
      })
      .catch(() => localStorage.removeItem("auth-token"));
  }, []);

  // Sends login request to backend
  const login = async (username: string, password: string) => {
    const {
      token,
      refreshToken: newRefreshToken,
      user,
    } = await apiLogin(username, password);
    setUser(user);
    setAccessToken(token);
    setRefreshToken(newRefreshToken);
    localStorage.setItem("auth-token", token);
    if (newRefreshToken) {
      localStorage.setItem("refresh-token", newRefreshToken);
    }
  };

  // logout user and remove auth-token
  const logout = () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("refresh-token");
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  };

  // checks for role
  const hasRole = (role: string) => {
    return user?.role.includes(role) ?? false;
  };

  // checks for department
  const hasDepartment = (department: string | null): boolean => {
    return user?.department === department;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        accessToken,
        refreshToken,
        hasRole,
        hasDepartment,
        login,
        logout,
      }}
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

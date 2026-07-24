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
      .catch(() => localStorage.removeItem("auth-token"))
      .finally(() => setIsLoading(false));
  }, []);

  // Sends login request to backend
  const login = async (username: string, password: string) => {
    const { token, user } = await apiLogin(username, password);
    localStorage.setItem("auth-token", token);
    setUser(user);
  };

  // logout user and remove auth-token
  const logout = () => {
    localStorage.removeItem("auth-token");
    setUser(null);
  };

  // checks for role
  const hasRole = (role: string) => {
    return user?.role.includes(role) ?? false;
  };

  // checks for department
  const hasDepartment = (department: string | null): boolean => {
    return user?.department === department;
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
      value={{
        isAuthenticated,
        isLoading,
        user,
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

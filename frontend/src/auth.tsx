import React, { createContext, useContext, useState, useEffect } from "react";

import {
  login as apiLogin,
  validateToken as apiValidateToken,
  refresh as apiRefresh,
} from "@/api/auth";

import type { AuthState, User } from "@/types";

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  // checks for token existence and validates it, falling back to a
  // refresh if the access token has expired. Blocks router mount
  // via `isLoading` so route guards never see a stale null-user state.
  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    const storedRefreshToken = localStorage.getItem("refresh-token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    apiValidateToken(token)
      .then((validatedUser) => {
        if (!validatedUser) throw new Error("Invalid token");
        setUser(validatedUser);
        setAccessToken(token);
        if (storedRefreshToken) setRefreshToken(storedRefreshToken);
      })
      .catch(async () => {
        if (!storedRefreshToken) {
          localStorage.removeItem("auth-token");
          return;
        }

        try {
          const {
            token: newToken,
            refreshToken: newRefreshToken,
            user: refreshedUser,
          } = await apiRefresh(storedRefreshToken);

          setUser(refreshedUser);
          setAccessToken(newToken);
          localStorage.setItem("auth-token", newToken);

          if (newRefreshToken) {
            setRefreshToken(newRefreshToken);
            localStorage.setItem("refresh-token", newRefreshToken);
          }
        } catch {
          localStorage.removeItem("auth-token");
          localStorage.removeItem("refresh-token");
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

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

  const logout = () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("refresh-token");
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  };

  const hasRole = (role: string) => {
    return user?.role.includes(role) ?? false;
  };

  const hasDepartment = (department: string | null): boolean => {
    return user?.department === department;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
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

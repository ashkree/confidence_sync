import React, { useState, useEffect } from "react";

import {
  login as apiLogin,
  hydrate as apiHydrate,
  logout as apiLogout,
} from "@/features/auth/api";
import { setAccessToken, setAuthFailureHandler } from "@/lib/auth-token";

import type { User } from "./types";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = user !== null;

  const logout = async () => {
    setAccessToken(null);
    setUser(null);

    await apiLogout().catch(() => {});
  };
  useEffect(() => {
    apiHydrate()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setAuthFailureHandler(logout);
    return () => setAuthFailureHandler(null);
  }, []);

  const login = async (email: string, password: string) => {
    const { token } = await apiLogin(email, password);
    setAccessToken(token);
    setUser(await apiHydrate());
  };

  const hasRole = (role: string) => user?.role.includes(role) ?? false;

  const hasDepartment = (department: string | null) =>
    user?.department === department;

  return (
    <AuthContext
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
    </AuthContext>
  );
}

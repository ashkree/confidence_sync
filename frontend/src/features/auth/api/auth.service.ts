// api/auth/auth.service.ts

import type { User } from "../types";
import { apiClient } from "@/lib/api-client";

interface TokenResponse {
  token: string;
}

export async function login(email: string, password: string) {
  const { data } = await apiClient.post<TokenResponse>("/auth/login", {
    email,
    password,
  });
  return { token: data.token };
}

export async function hydrate(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

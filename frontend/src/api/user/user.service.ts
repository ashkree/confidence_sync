// api/user/user.service.ts
import type { UserProfile } from "@/types";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("auth-token");
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

export async function fetchProfile(): Promise<UserProfile> {
  return fetchWithAuth("/api/v1/auth/profile");
}

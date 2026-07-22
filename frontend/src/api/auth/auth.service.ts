// api/auth/auth.service.ts

import type { User } from "@/types";

type BackendUser = {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  leave_days: number;
  created_at: string;
  updated_at: string;
  role: "employee" | "hr_admin" | "it_admin";
  department: "hr" | "it" | "other";
};

function mapUser(backendUser: BackendUser): User {
  if (backendUser.role === "employee") {
    return { ...backendUser, role: "employee", department: null };
  }
  return {
    ...backendUser,
    role: "admin",
    department: backendUser.role === "hr_admin" ? "hr" : "it",
  };
}

export async function login(email: string, password: string) {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Authentication failed");
  const data = await res.json();
  return { token: data.token, user: mapUser(data.user) };
}

export async function validateToken(token: string) {
  const res = await fetch("/api/validate-token", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.valid ? mapUser(data.user) : null;
}

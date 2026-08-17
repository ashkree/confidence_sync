import type { Document } from "@/types";

async function fetchWithAuth(url: string) {
  const token = localStorage.getItem("auth-token");
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

export async function fetchDocuments(category?: string): Promise<Document[]> {
  const url = category
    ? `${import.meta.env.VITE_API_URL}/documents?category=${category}`
    : `${import.meta.env.VITE_API_URL}/documents`;
  return fetchWithAuth(url);
}

export async function fetchMyDocuments(): Promise<Document[]> {
  return fetchWithAuth("/api/v1/documents/me");
}


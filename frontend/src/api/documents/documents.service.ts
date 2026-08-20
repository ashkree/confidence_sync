import type { Document } from "@/types";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("auth-token");
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);

  // POST /documents/create returns 201 with no body — guard against
  // res.json() throwing on an empty response
  const text = await res.text();
  return text ? JSON.parse(text) : undefined;
}

export async function fetchDocuments(category?: string): Promise<Document[]> {
  const url = category
    ? `/api/v1/documents?category=${category}`
    : `/api/v1/documents`;
  return fetchWithAuth(url);
}

export async function fetchMyDocuments(): Promise<Document[]> {
  return fetchWithAuth("/api/v1/documents/me");
}

export async function createDocument(
  file: File,
  fileName: string,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("file_name", fileName);

  await fetchWithAuth("/api/v1/documents/create", {
    method: "POST",
    body: formData,
  });
}

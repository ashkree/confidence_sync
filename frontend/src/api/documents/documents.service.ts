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

// Like fetchWithAuth, but returns the raw Response instead of parsing JSON —
// needed for binary payloads (PDFs) rather than JSON bodies.
async function fetchFileWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("auth-token");
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res;
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

async function getDocument(
  id: string,
  mode: "view" | "download",
): Promise<void> {
  const res = await fetchFileWithAuth(`/api/v1/documents/${id}/${mode}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  if (mode === "view") {
    window.open(url, "_blank");
  } else {
    const a = document.createElement("a");
    a.href = url;
    a.download = ""; // filename is governed by the server's Content-Disposition header
    a.click();
  }

  // Defer revoke slightly — an immediate revoke can race the new tab/
  // download actually reading the blob on some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function viewDocument(id: string): Promise<void> {
  return getDocument(id, "view");
}

export async function downloadDocument(id: string): Promise<void> {
  return getDocument(id, "download");
}

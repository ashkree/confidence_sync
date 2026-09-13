import { apiClient } from "@/lib/api-client";
import type { Document } from "../types";

export async function fetchDocuments(category?: string): Promise<Document[]> {
  const { data } = await apiClient.get<Document[]>("/documents", {
    params: category ? { category: category } : undefined,
  });
  return data;
}

export async function fetchMyDocuments(): Promise<Document[]> {
  const { data } = await apiClient.get<Document[]>("/documents");
  return data;
}

export async function createDocument(
  file: File,
  fileName: string,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("file_name", fileName);

  await apiClient.post("/documents/create", formData);
}

async function getDocument(
  id: string,
  mode: "view" | "download",
): Promise<void> {
  const { data } = await apiClient.get(`/documents/${id}/${mode}`, {
    responseType: "blob",
  });

  const url = URL.createObjectURL(data);

  if (mode === "view") {
    window.open(url, "_blank");
  } else {
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.pdf";
    a.click();
  }

  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function viewDocument(id: string): Promise<void> {
  return getDocument(id, "view");
}

export async function downloadDocument(id: string): Promise<void> {
  return getDocument(id, "download");
}

export async function deleteDocument(id: string): Promise<void> {
  await apiClient.delete(`/documents/${id}`);
}

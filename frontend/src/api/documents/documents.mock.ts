import { getDocumentsByCategory, getAllDocuments } from "@/data";
import type { Document } from "@/types";

export async function fetchDocuments(category?: string): Promise<Document[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (category) {
    return getDocumentsByCategory(category);
  }
  return getAllDocuments();
}

export async function fetchMyDocuments(): Promise<Document[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return getAllDocuments();
}

export async function createDocument(
  file: File,
  fileName: string,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500));
}

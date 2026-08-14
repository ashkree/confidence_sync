import type { Document } from "@/types";
import docsData from "../documents.json";

const allDocuments: Document[] = docsData as Document[];

export function getAllDocuments(): Document[] {
  return allDocuments;
}

export function getDocumentsByCategory(category: string): Document[] {
  return allDocuments.filter((d) => d.category === category);
}

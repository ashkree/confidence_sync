import type { Document } from "@/types";

export async function fetchDocuments(category?: string): Promise<Document[]> {
  const url = category 
    ? `${import.meta.env.VITE_API_URL}/documents?category=${category}` 
    : `${import.meta.env.VITE_API_URL}/documents`;
    
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}

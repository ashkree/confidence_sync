import { getAllDocuments } from "@/data";
import type { Document } from "@/types";
import { formatDate } from "@/lib/date";

let _mockDocuments: Document[] | null = null;

function getMockDocuments(): Document[] {
  if (!_mockDocuments) {
    try {
      const stored = sessionStorage.getItem("mockDocuments_v1");
      if (stored) {
        _mockDocuments = JSON.parse(stored);
      } else {
        _mockDocuments = getAllDocuments();
      }
    } catch {
      _mockDocuments = getAllDocuments();
    }
  }
  return _mockDocuments!;
}

function saveMockDocuments() {
  if (_mockDocuments) {
    sessionStorage.setItem("mockDocuments_v1", JSON.stringify(_mockDocuments));
  }
}

export async function fetchDocuments(category?: string): Promise<Document[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (category) {
    return getMockDocuments().filter((d) => d.category === category);
  }
  return getMockDocuments();
}

export async function fetchMyDocuments(): Promise<Document[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return getMockDocuments();
}

export async function createDocument(
  _file: File,
  fileName: string,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const today = formatDate(new Date());
  const newDocument: Document = {
    id: `uuid-doc-${Date.now()}`,
    file_name: fileName.toLowerCase().replace(/\s+/g, "-"),
    category: "HR_POLICY", // mock stand-in — no department context available here
    created_at: today,
    updated_at: today,
  };

  _mockDocuments = [...getMockDocuments(), newDocument];
  saveMockDocuments();
}

async function getDocument(
  id: string,
  mode: "view" | "download",
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const doc = getMockDocuments().find((d) => d.id === id);
  if (!doc) throw new Error("Document not found");

  if (mode === "view") {
    window.open("/placeholder.pdf", "_blank");
  } else {
    const a = document.createElement("a");
    a.href = "/placeholder.pdf";
    a.download = doc.file_name;
    a.click();
  }
}

export async function viewDocument(id: string): Promise<void> {
  return getDocument(id, "view");
}

export async function downloadDocument(id: string): Promise<void> {
  return getDocument(id, "download");
}

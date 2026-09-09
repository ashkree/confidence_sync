import * as mock from "@/features/knowledge-base/api/kb.mock";
import * as service from "@/features/knowledge-base/api/kb.service";
import { USE_MOCK_DATA } from "@/lib/env";

const useMock = USE_MOCK_DATA;

export const {
  fetchDocuments,
  fetchMyDocuments,
  createDocument,
  viewDocument,
  downloadDocument,
  deleteDocument,
} = useMock ? mock : service;

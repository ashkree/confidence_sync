import * as mock from "./documents.mock";
import * as service from "./documents.service";
import { USE_MOCK_DATA } from "@/lib/env";

const useMock = USE_MOCK_DATA;

export const { fetchDocuments, fetchMyDocuments } = useMock ? mock : service;

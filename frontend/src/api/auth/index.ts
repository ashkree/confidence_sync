// api/auth/index.ts
import * as mock from "./auth.mock";
import * as service from "./auth.service";
import { USE_MOCK_DATA, SHOW_DEV_TOOLS } from "@/lib/env";

const useMock = USE_MOCK_DATA;

export const { login, validateToken, refresh } = useMock ? mock : service;

export const MOCK_USERS = SHOW_DEV_TOOLS ? mock.MOCK_USERS : null;

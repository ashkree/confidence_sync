// api/auth/index.ts
import * as mock from "./auth.mock";
import * as service from "./auth.service";

const useMock = import.meta.env.VITE_USE_MOCK === "true";

export const { login, validateToken, refresh } = useMock ? mock : service;

export const MOCK_USERS = useMock ? mock.MOCK_USERS : null;

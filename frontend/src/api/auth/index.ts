// api/auth/index.ts
import * as mock from "./auth.mock";
import * as service from "./auth.service";

const useMock = import.meta.env.VITE_USE_MOCK === "true";

export const { login, validateToken } = useMock ? mock : service;

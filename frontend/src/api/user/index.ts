// api/user/index.ts
import * as mock from "./user.mock";
import * as service from "./user.service";

const useMock = import.meta.env.VITE_USE_MOCK === "true";

export const { fetchProfile } = useMock ? mock : service;

// api/user/index.ts
import * as mock from "./user.mock";
import * as service from "./user.service";
import { USE_MOCK_DATA } from "@/lib/env";

const useMock = USE_MOCK_DATA;

export const { fetchProfile } = useMock ? mock : service;

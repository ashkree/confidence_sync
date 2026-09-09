// api/user/index.ts
import * as mock from "@/features/profile/api/profile.mock";
import * as service from "@/features/profile/api/profile.service";
import { USE_MOCK_DATA } from "@/lib/env";

const useMock = USE_MOCK_DATA;

export const { fetchProfile } = useMock ? mock : service;

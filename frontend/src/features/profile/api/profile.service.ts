import { apiClient } from "@/lib/api-client";
import type { UserProfile } from "../types";

export async function fetchProfile(): Promise<UserProfile> {
  const { data } = await apiClient.get<UserProfile>("/auth/profile");
  return data;
}

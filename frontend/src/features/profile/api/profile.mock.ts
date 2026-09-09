// api/user/user.mock.ts
import type { UserProfile } from "../types";
import { MOCK_USERS } from "@/features/auth/api/auth.mock";
import { formatDate } from "@/lib/date";

const ACCESS_PREFIX = "mock-token-";

export async function fetchProfile(): Promise<UserProfile> {
  await new Promise((r) => setTimeout(r, 200));

  const token = localStorage.getItem("auth-token") ?? "";
  const username = token.replace(ACCESS_PREFIX, "");
  const user = MOCK_USERS?.[username];

  if (!user) throw new Error("Mock user not found");

  const today = formatDate(new Date());
  return {
    ...user,
    phone_number: (user as Partial<UserProfile>).phone_number ?? "+0 (000) 000-0000",
    leave_days: (user as Partial<UserProfile>).leave_days ?? 0,
    created_at: (user as Partial<UserProfile>).created_at ?? today,
    updated_at: (user as Partial<UserProfile>).updated_at ?? today,
  };
}

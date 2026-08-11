// api/user/user.mock.ts
import type { UserProfile } from "@/types";
import { MOCK_USERS } from "@/api/auth";

const ACCESS_PREFIX = "mock-token-";

export async function fetchProfile(): Promise<UserProfile> {
  await new Promise((r) => setTimeout(r, 200));

  const token = localStorage.getItem("auth-token") ?? "";
  const username = token.replace(ACCESS_PREFIX, "");
  const user = MOCK_USERS?.[username];

  if (!user) throw new Error("Mock user not found");

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    phone_number: (user as UserProfile).phone_number ?? "+0 (000) 000-0000",
    leave_days: (user as UserProfile).leave_days ?? 0,
    created_at: (user as UserProfile).created_at ?? new Date().toISOString(),
    updated_at: (user as UserProfile).updated_at ?? new Date().toISOString(),
  };
}

// api/auth/auth.mock.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
import { getUsersByEmail } from "@/data";

export const MOCK_USERS = getUsersByEmail();

const REFRESH_PREFIX = "mock-refresh-";
const ACCESS_PREFIX = "mock-token-";

export async function login(username: string, _password: string) {
  await new Promise((r) => setTimeout(r, 300));

  const user = MOCK_USERS[username];
  if (!user)
    throw new Error(
      `Mock user "${username}" not found. Available users:\n` +
        Object.keys(MOCK_USERS).join("\n"),
    );

  return {
    token: `${ACCESS_PREFIX}${username}`,
    refreshToken: `${REFRESH_PREFIX}${username}`,
    user,
  };
}

export async function validateToken(token: string) {
  await new Promise((r) => setTimeout(r, 100));

  const username = token.replace(ACCESS_PREFIX, "");
  return MOCK_USERS[username] ?? null;
}

export async function refresh(refreshToken: string, _email?: string) {
  await new Promise((r) => setTimeout(r, 100));

  if (!refreshToken.startsWith(REFRESH_PREFIX)) {
    throw new Error("Invalid mock refresh token");
  }

  const username = refreshToken.replace(REFRESH_PREFIX, "");
  const user = MOCK_USERS[username];
  if (!user) throw new Error("Invalid mock refresh token");

  return {
    token: `${ACCESS_PREFIX}${username}`,
    refreshToken: `${REFRESH_PREFIX}${username}`,
    user,
  };
}

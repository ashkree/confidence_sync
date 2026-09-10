// api/auth/auth.mock.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
import { getUsersByEmail } from "@/mocks";
import { setAccessToken } from "@/lib/auth-token";
import type { User } from "../types";

export const MOCK_USERS = getUsersByEmail();

const ACCESS_PREFIX = "mock-token-";
const SESSION_KEY = "mock-session-email";

export async function login(email: string, _password: string) {
  await new Promise((r) => setTimeout(r, 300));

  const user = MOCK_USERS[email];
  if (!user) {
    throw new Error(
      `Mock user "${email}" not found. Available users:\n` +
        Object.keys(MOCK_USERS).join("\n"),
    );
  }

  // Stands in for the httpOnly cookie: something outside memory that
  // survives reload so hydrate() can resolve a user on boot.
  sessionStorage.setItem(SESSION_KEY, email);

  return { token: `${ACCESS_PREFIX}${email}` };
}

export async function hydrate(): Promise<User> {
  await new Promise((r) => setTimeout(r, 100));

  const email = sessionStorage.getItem(SESSION_KEY);
  const user = email ? MOCK_USERS[email] : null;
  if (!user) throw new Error("No mock session");

  setAccessToken(`${ACCESS_PREFIX}${email}`);
  return user;
}

export async function logout(): Promise<void> {
  sessionStorage.removeItem(SESSION_KEY);
}

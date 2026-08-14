import type { User } from "@/types";
import usersData from "../users.json";

const users: User[] = usersData as User[];

export function getAllUsers(): User[] {
  return users;
}

export function getUserById(id: string): User | null {
  return users.find((u) => u.id === id) ?? null;
}

export function getUserByEmail(email: string): User | null {
  return users.find((u) => u.email === email) ?? null;
}

export function getUserNameById(id: string): string | null {
  return getUserById(id)?.name ?? null;
}

/** Build the email-keyed record that auth.mock.ts needs */
export function getUsersByEmail(): Record<string, User> {
  return Object.fromEntries(users.map((u) => [u.email, u]));
}

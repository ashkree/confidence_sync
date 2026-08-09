// api/auth/auth.mock.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { User } from "@/types";

export const MOCK_USERS: Record<string, User> = {
  // Employees
  "employee1@example.com": {
    id: "e1",
    name: "Employee One",
    email: "employee1@example.com",
    phone_number: "+1 (555) 100-0001",
    leave_days: 14,
    created_at: "2025-01-15T09:00:00Z",
    updated_at: "2025-01-15T09:00:00Z",
    role: "employee",
    department: null,
  },
  "employee2@example.com": {
    id: "e2",
    name: "Employee Two",
    email: "employee2@example.com",
    phone_number: "+1 (555) 100-0002",
    leave_days: 10,
    created_at: "2025-01-15T09:00:00Z",
    updated_at: "2025-01-15T09:00:00Z",
    role: "employee",
    department: null,
  },
  "employee3@example.com": {
    id: "e3",
    name: "Employee Three",
    email: "employee3@example.com",
    phone_number: "+1 (555) 100-0003",
    leave_days: 7,
    created_at: "2025-01-15T09:00:00Z",
    updated_at: "2025-01-15T09:00:00Z",
    role: "employee",
    department: null,
  },
  "employee4@example.com": {
    id: "e4",
    name: "Employee Four",
    email: "employee4@example.com",
    phone_number: "+1 (555) 100-0004",
    leave_days: 21,
    created_at: "2025-01-15T09:00:00Z",
    updated_at: "2025-01-15T09:00:00Z",
    role: "employee",
    department: null,
  },
  "employee5@example.com": {
    id: "e5",
    name: "Employee Five",
    email: "employee5@example.com",
    phone_number: "+1 (555) 100-0005",
    leave_days: 5,
    created_at: "2025-01-15T09:00:00Z",
    updated_at: "2025-01-15T09:00:00Z",
    role: "employee",
    department: null,
  },

  // HR Admins
  "hr1@example.com": {
    id: "ahr1",
    name: "HR Admin One",
    email: "hr1@example.com",
    phone_number: "+1 (555) 200-0001",
    leave_days: 18,
    created_at: "2025-01-15T09:00:00Z",
    updated_at: "2025-01-15T09:00:00Z",
    role: "admin",
    department: "hr",
  },
  "hr2@example.com": {
    id: "ahr2",
    name: "HR Admin Two",
    email: "hr2@example.com",
    phone_number: "+1 (555) 200-0002",
    leave_days: 12,
    created_at: "2025-01-15T09:00:00Z",
    updated_at: "2025-01-15T09:00:00Z",
    role: "admin",
    department: "hr",
  },
  "hr3@example.com": {
    id: "ahr3",
    name: "HR Admin Three",
    email: "hr3@example.com",
    phone_number: "+1 (555) 200-0003",
    leave_days: 9,
    created_at: "2025-01-15T09:00:00Z",
    updated_at: "2025-01-15T09:00:00Z",
    role: "admin",
    department: "hr",
  },

  // IT Admins
  "it1@example.com": {
    id: "ait1",
    name: "IT Admin One",
    email: "it1@example.com",
    phone_number: "+1 (555) 300-0001",
    leave_days: 16,
    created_at: "2025-01-15T09:00:00Z",
    updated_at: "2025-01-15T09:00:00Z",
    role: "admin",
    department: "it",
  },
  "it2@example.com": {
    id: "ait2",
    name: "IT Admin Two",
    email: "it2@example.com",
    phone_number: "+1 (555) 300-0002",
    leave_days: 11,
    created_at: "2025-01-15T09:00:00Z",
    updated_at: "2025-01-15T09:00:00Z",
    role: "admin",
    department: "it",
  },
  "it3@example.com": {
    id: "ait3",
    name: "IT Admin Three",
    email: "it3@example.com",
    phone_number: "+1 (555) 300-0003",
    leave_days: 8,
    created_at: "2025-01-15T09:00:00Z",
    updated_at: "2025-01-15T09:00:00Z",
    role: "admin",
    department: "it",
  },
};

export async function login(username: string, _password: string) {
  await new Promise((r) => setTimeout(r, 300));

  const user = MOCK_USERS[username];
  if (!user)
    throw new Error(
      `Mock user "${username}" not found. Available users:\n` +
        Object.keys(MOCK_USERS).join("\n"),
    );

  return { token: `mock-token-${username}`, refreshToken: null, user };
}

export async function validateToken(token: string) {
  await new Promise((r) => setTimeout(r, 100));

  const username = token.replace("mock-token-", "");
  return MOCK_USERS[username] ?? null;
}

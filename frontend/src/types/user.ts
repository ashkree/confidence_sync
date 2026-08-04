// api/auth/types.ts

interface BaseUser {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  leave_days: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends BaseUser {}

export interface Employee extends BaseUser {
  role: "employee";
  department: null;
}

export interface Admin extends BaseUser {
  role: "admin";
  department: "hr" | "it";
}

export type User = Employee | Admin;

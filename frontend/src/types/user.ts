// api/auth/types.ts

interface BaseUser {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  leave_days?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile extends BaseUser {
  role: "EMPLOYEE" | "ADMIN";
  department: "HR" | "IT" | null;
  phone_number: string;
  leave_days: number;
  created_at: string;
  updated_at: string;
}

export interface Employee extends BaseUser {
  role: "EMPLOYEE";
  department: null;
}

export interface Admin extends BaseUser {
  role: "ADMIN";
  department: "HR" | "IT";
}

export type User = Employee | Admin;

import type { User } from "@/features/auth/types";

export type UserProfile = User & {
  phone_number: string;
  leave_days: number;
  created_at: string;
  updated_at: string;
};

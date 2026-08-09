import type { User } from "./user";

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  hasRole: (role: string) => boolean;
  hasDepartment: (department: string | null) => boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

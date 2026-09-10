export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  hasRole: (role: string) => boolean;
  hasDepartment: (department: string | null) => boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

interface BaseUser {
  id: string;
  name: string;
  email: string;
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

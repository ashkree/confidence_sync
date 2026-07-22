export interface User {
  id: string;
  name: string;
  leave_days: string;
  department: string;
  role: string;
  phone_number: string;
}

export type Credentials = {
  email: string;
  password: string;
};

export async function login({ email, password }: Credentials): Promise<void> {
  // Replace with your authentication logic
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Authentication failed");
  }

  return await response.json();
}

type LogoutProps = {
  onLogout: () => void;
};

export function logout({ onLogout }: LogoutProps) {
  onLogout();
}

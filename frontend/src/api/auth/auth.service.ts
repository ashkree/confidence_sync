// api/auth/auth.service.ts

export async function login(email: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Authentication failed");
  const data = await res.json();
  return { token: data.token, user: data.user };
}

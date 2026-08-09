// api/auth/auth.service.ts

export async function login(email: string, password: string) {
  const res = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Authentication failed");
  const data = await res.json();
  return { token: data.token, refreshToken: data.refresh_token, user: data.user };
}

export async function validateToken(token: string) {
  const res = await fetch("/api/v1/auth/me", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Token validation failed");
  return res.json();
}

export async function refresh(email: string, refreshToken: string) {
  const res = await fetch("/api/v1/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, refresh_token: refreshToken }),
  });
  if (!res.ok) throw new Error("Refresh token failed");
  const data = await res.json();
  return { token: data.token, refreshToken: data.refresh_token, user: data.user };
}

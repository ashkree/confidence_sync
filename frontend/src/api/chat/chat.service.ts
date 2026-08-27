import type { ChatMessage } from "@/types";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("auth-token");
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

/** Retrieve chat history for an existing session */
export async function fetchChatMessages(
  sessionId: string,
): Promise<ChatMessage[]> {
  return fetchWithAuth(
    `/api/v1/chat/messages?session_id=${encodeURIComponent(sessionId)}`,
  );
}

/** Send a message and receive the assistant's reply */
export async function sendChatMessage(
  sessionId: string,
  content: string,
): Promise<ChatMessage> {
  return fetchWithAuth("/api/v1/chat/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, content }),
  });
}

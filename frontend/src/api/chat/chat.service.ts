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

/** Response shape from GET /chat/messages */
export interface MessagesResponse {
  session_id: string;
  messages: ChatMessage[];
}

/** Response shape from POST /chat/send */
export interface SendMessageResponse {
  session_id: string;
  message: ChatMessage;
}

/** Retrieve chat history for an existing session, or create a new session */
export async function fetchChatMessages(
  sessionId: string | null,
): Promise<MessagesResponse> {
  const url = sessionId
    ? `/api/v1/chat/messages?session_id=${encodeURIComponent(sessionId)}`
    : `/api/v1/chat/messages`;
  return fetchWithAuth(url);
}

/** Send a message and receive the assistant's reply */
export async function sendChatMessage(
  sessionId: string,
  content: string,
): Promise<SendMessageResponse> {
  return fetchWithAuth("/api/v1/chat/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, content }),
  });
}

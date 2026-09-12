import { apiClient } from "@/lib/api-client";
import type { ChatMessage } from "../types";

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
  const { data } = await apiClient.get<MessagesResponse>("/chat/messages", {
    params: sessionId ? { session_id: sessionId } : undefined,
  });
  return data;
}

/** Send a message and receive the assistant's reply */
export async function sendChatMessage(
  sessionId: string,
  content: string,
): Promise<SendMessageResponse> {
  const { data } = await apiClient.post<SendMessageResponse>("/chat/send", {
    session_id: sessionId,
    content,
  });
  return data;
}

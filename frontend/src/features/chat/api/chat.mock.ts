import type { MessagesResponse, SendMessageResponse } from "./chat.service";
import type { ChatMessage } from "../types";

let mockSessionId = crypto.randomUUID();
const mockHistory: ChatMessage[] = [];

export async function fetchChatMessages(
  sessionId: string | null,
): Promise<MessagesResponse> {
  await new Promise((r) => setTimeout(r, 500));
  if (!sessionId) {
    mockSessionId = crypto.randomUUID();
  }
  return { session_id: mockSessionId, messages: [...mockHistory] };
}

export async function sendChatMessage(
  sessionId: string,
  content: string,
): Promise<SendMessageResponse> {
  await new Promise((r) => setTimeout(r, 1000));
  mockHistory.push({ role: "USER", content });
  const reply: ChatMessage = {
    role: "ASSISTANT",
    content: `I received your message: "${content}". This is a mock response.`,
  };
  mockHistory.push(reply);
  return { session_id: sessionId, message: reply };
}

export async function resetChatSession(
  _sessionId: string,
): Promise<MessagesResponse> {
  void _sessionId;
  await new Promise((r) => setTimeout(r, 300));
  mockSessionId = crypto.randomUUID();
  mockHistory.length = 0;
  return { session_id: mockSessionId, messages: [] };
}


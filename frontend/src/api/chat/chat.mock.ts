import type { ChatMessage } from "@/types";

const mockHistory: ChatMessage[] = [];

export async function fetchChatMessages(
  _sessionId: string,
): Promise<ChatMessage[]> {
  await new Promise((r) => setTimeout(r, 500));
  return [...mockHistory];
}

export async function sendChatMessage(
  _sessionId: string,
  content: string,
): Promise<ChatMessage> {
  await new Promise((r) => setTimeout(r, 1000));
  mockHistory.push({ role: "human", content });
  const reply: ChatMessage = {
    role: "assistant",
    content: `I received your message: "${content}". This is a mock response.`,
  };
  mockHistory.push(reply);
  return reply;
}

import * as mock from "./chat.mock";
import * as service from "./chat.service";
import { USE_MOCK_DATA } from "@/lib/env";

const useMock = USE_MOCK_DATA;

export const { fetchChatMessages, sendChatMessage } = useMock
  ? mock
  : service;

export type { MessagesResponse, SendMessageResponse } from "./chat.service";

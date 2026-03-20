import { apiRequest } from "@/services/api-client";

export interface ChatPayload {
  userId: string;
  message: string;
}

export interface ChatResponse {
  reply: string;
}

export const chatService = {
  sendMessage(payload: ChatPayload) {
    return apiRequest<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
};

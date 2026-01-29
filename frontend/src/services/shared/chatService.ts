import { axiosInstance } from "@/config/axios.config";

export interface MediaAttachment {
  type: "image" | "video" | "file";
  url: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface ChatMessage {
  _id: string;
  clientId: string;
  therapistId: string;
  senderRole: "client" | "therapist";
  content: string;
  attachments?: MediaAttachment[];
  createdAt: string;
  readByClient: boolean;
  readByTherapist: boolean;
}

export interface TherapistConversation {
  clientId: string;
  clientName: string;
  lastMessage: string;
  lastMessageAt: string;
  profileImg?: string;
  unreadCount?: number;
}

export const chatService = {
  getClientMessages: async (therapistId: string) => {
    const res = await axiosInstance.get(`/client/chat/${therapistId}/messages`);
    return res.data.data as ChatMessage[];
  },

  getTherapistMessages: async (clientId: string) => {
    const res = await axiosInstance.get(`/therapist/chat/${clientId}/messages`);
    return res.data.data as ChatMessage[];
  },

  getTherapistConversations: async () => {
    const res = await axiosInstance.get("/therapist/chat/conversations");
    return res.data.data as TherapistConversation[];
  },
};

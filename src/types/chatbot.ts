export interface Chatbot {
  id: string;
  name: string;
  description?: string;
  n8nWebhookUrl: string;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  chatbotId: string;
  userId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  isFromUser: boolean;
  createdAt: string;
}
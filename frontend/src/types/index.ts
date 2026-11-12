export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens?: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: number;
  title: string;
  model: string;
  folder?: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description?: string;
  context_window: number;
  is_active: boolean;
}

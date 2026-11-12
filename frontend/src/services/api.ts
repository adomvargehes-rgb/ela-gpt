import { Conversation, AIModel, Message } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function fetchModels(): Promise<AIModel[]> {
  try {
    const res = await fetch(`${API_BASE}/models`);
    if (!res.ok) throw new Error('Failed to fetch models');
    return await res.json();
  } catch (error) {
    console.error('Error fetching models:', error);
    return [
      { id: 'ela-gpt-v4-turbo', name: 'Ela GPT v4 Turbo', provider: 'mock', description: 'Fast multimodal model', context_window: 128000, is_active: true },
      { id: 'ela-gpt-v4-reasoner', name: 'Ela GPT v4 Reasoner', provider: 'mock', description: 'Advanced reasoning model', context_window: 64000, is_active: true },
    ];
  }
}

export async function fetchConversations(): Promise<Conversation[]> {
  try {
    const res = await fetch(`${API_BASE}/conversations`);
    if (!res.ok) throw new Error('Failed to fetch conversations');
    return await res.json();
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
}

export async function createConversation(title?: string, model?: string, folder?: string): Promise<Conversation> {
  const res = await fetch(`${API_BASE}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title || 'New Conversation', model: model || 'ela-gpt-v4-turbo', folder: folder || 'Coding' }),
  });
  if (!res.ok) throw new Error('Failed to create conversation');
  return await res.json();
}

export async function updateConversation(id: string, updates: { title?: string; model?: string; folder?: string }): Promise<Conversation> {
  const res = await fetch(`${API_BASE}/conversations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update conversation');
  return await res.json();
}

export async function deleteConversationApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/conversations/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete conversation');
}

export async function sendMessageApi(conversationId: string | null, message: string, model: string) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversation_id: conversationId, message, model, stream: false }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return await res.json();
}

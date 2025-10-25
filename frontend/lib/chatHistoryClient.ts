const API_BASE = 'http://localhost:3001/api';

export interface Chat {
  _id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  createdAt: string;
}

export const chatHistoryApi = {
  /**
   * Create a new chat session
   */
  async createChat(token: string, title?: string): Promise<Chat> {
    const response = await fetch(`${API_BASE}/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error('Failed to create chat');
    }

    return response.json();
  },

  /**
   * Get all user's chats
   */
  async getUserChats(token: string): Promise<Chat[]> {
    const response = await fetch(`${API_BASE}/chats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chats');
    }

    return response.json();
  },

  /**
   * Get a specific chat with all messages
   */
  async getChatById(token: string, chatId: string): Promise<Chat> {
    const response = await fetch(`${API_BASE}/chats/${chatId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chat');
    }

    return response.json();
  },

  /**
   * Add a message to a chat
   */
  async addMessage(
    token: string,
    chatId: string,
    role: 'user' | 'assistant',
    content: string,
    model?: string,
  ): Promise<Chat> {
    const response = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role, content, model }),
    });

    if (!response.ok) {
      throw new Error('Failed to add message');
    }

    return response.json();
  },

  /**
   * Update chat title
   */
  async updateChatTitle(
    token: string,
    chatId: string,
    title: string,
  ): Promise<Chat> {
    const response = await fetch(`${API_BASE}/chats/${chatId}/title`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error('Failed to update chat title');
    }

    return response.json();
  },

  /**
   * Delete a chat
   */
  async deleteChat(token: string, chatId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/chats/${chatId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete chat');
    }
  },
};

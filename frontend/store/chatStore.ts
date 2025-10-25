import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, ChatConfig } from '@/types';
import { DEFAULT_CHAT_CONFIG } from '@/config/models';

interface ChatState {
  messages: Message[];
  selectedModel: string;
  isTyping: boolean;
  config: ChatConfig;
  
  // Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setSelectedModel: (model: string) => void;
  setIsTyping: (isTyping: boolean) => void;
  updateConfig: (config: Partial<ChatConfig>) => void;
  deleteMessage: (id: string) => void;
  exportChat: () => string;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      selectedModel: 'gpt-4o-mini',
      isTyping: false,
      config: DEFAULT_CHAT_CONFIG,

      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },

      clearMessages: () => set({ messages: [] }),

      setSelectedModel: (model) => set({ selectedModel: model }),

      setIsTyping: (isTyping) => set({ isTyping }),

      updateConfig: (newConfig) =>
        set((state) => ({
          config: { ...state.config, ...newConfig },
        })),

      deleteMessage: (id) =>
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== id),
        })),

      exportChat: () => {
        const { messages, selectedModel } = get();
        const exportData = {
          model: selectedModel,
          exportDate: new Date().toISOString(),
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
          })),
        };
        return JSON.stringify(exportData, null, 2);
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        messages: state.messages,
        selectedModel: state.selectedModel,
        config: state.config,
      }),
    }
  )
);

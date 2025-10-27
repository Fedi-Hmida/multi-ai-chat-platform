import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, ChatConfig } from '@/types';
import { DEFAULT_CHAT_CONFIG } from '@/config/models';
import { ComparisonResponse } from '@/lib/apiClient';

interface ChatState {
  messages: Message[];
  selectedModel: string;
  isTyping: boolean;
  config: ChatConfig;
  
  // Comparison Mode
  isComparisonMode: boolean;
  selectedModelsForComparison: string[];
  comparisonResults: ComparisonResponse[];
  isComparing: boolean;
  
  // Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setSelectedModel: (model: string) => void;
  setIsTyping: (isTyping: boolean) => void;
  updateConfig: (config: Partial<ChatConfig>) => void;
  deleteMessage: (id: string) => void;
  exportChat: () => string;
  
  // Comparison Actions
  toggleComparisonMode: () => void;
  setSelectedModelsForComparison: (models: string[]) => void;
  setComparisonResults: (results: ComparisonResponse[]) => void;
  setIsComparing: (isComparing: boolean) => void;
  clearComparisonResults: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      selectedModel: 'gpt-4o-mini',
      isTyping: false,
      config: DEFAULT_CHAT_CONFIG,
      
      // Comparison Mode State
      isComparisonMode: false,
      selectedModelsForComparison: [],
      comparisonResults: [],
      isComparing: false,

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
      
      // Comparison Actions
      toggleComparisonMode: () => 
        set((state) => ({ 
          isComparisonMode: !state.isComparisonMode,
          comparisonResults: [],
        })),
      
      setSelectedModelsForComparison: (models) => 
        set({ selectedModelsForComparison: models }),
      
      setComparisonResults: (results) => 
        set({ comparisonResults: results }),
      
      setIsComparing: (isComparing) => 
        set({ isComparing }),
      
      clearComparisonResults: () => 
        set({ comparisonResults: [], isComparing: false }),
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

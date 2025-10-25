import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ChatHistoryItem {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatHistoryStore {
  // Chat history
  chats: ChatHistoryItem[];
  currentChatId: string | null;
  isSidebarOpen: boolean;
  
  // Actions
  setChats: (chats: ChatHistoryItem[]) => void;
  addChat: (chat: ChatHistoryItem) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  removeChat: (chatId: string) => void;
  setCurrentChatId: (chatId: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useChatHistoryStore = create<ChatHistoryStore>()(
  persist(
    (set) => ({
      chats: [],
      currentChatId: null,
      isSidebarOpen: true,

      setChats: (chats) => set({ chats }),

      addChat: (chat) =>
        set((state) => ({
          chats: [chat, ...state.chats],
        })),

      updateChatTitle: (chatId, title) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat._id === chatId
              ? { ...chat, title, updatedAt: new Date().toISOString() }
              : chat
          ),
        })),

      removeChat: (chatId) =>
        set((state) => ({
          chats: state.chats.filter((chat) => chat._id !== chatId),
          currentChatId: state.currentChatId === chatId ? null : state.currentChatId,
        })),

      setCurrentChatId: (chatId) => set({ currentChatId: chatId }),

      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
    }),
    {
      name: 'chat-history-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

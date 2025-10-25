'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMessageSquare, FiTrash2, FiEdit2, FiX, FiMenu } from 'react-icons/fi';
import { useChatHistoryStore } from '@/store/chatHistoryStore';
import { useAuthStore } from '@/store/authStore';
import { chatHistoryApi, Chat } from '@/lib/chatHistoryClient';
import { Button } from './ui/button';
import { useChatStore } from '@/store/chatStore';

export function ChatSidebar() {
  const { token } = useAuthStore();
  const { chats, currentChatId, isSidebarOpen, setChats, addChat, removeChat, setCurrentChatId, toggleSidebar } = useChatHistoryStore();
  const { clearMessages, setIsTyping } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Load chat history on mount
  useEffect(() => {
    if (token) {
      loadChatHistory();
    }
  }, [token]);

  const loadChatHistory = async () => {
    if (!token) return;
    
    try {
      const userChats = await chatHistoryApi.getUserChats(token);
      setChats(userChats);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleNewChat = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const newChat = await chatHistoryApi.createChat(token);
      addChat(newChat);
      setCurrentChatId(newChat._id);
      clearMessages();
      setIsTyping(false);
    } catch (error) {
      console.error('Failed to create new chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    if (!token || chatId === currentChatId) return;

    try {
      const chat = await chatHistoryApi.getChatById(token, chatId);
      setCurrentChatId(chatId);
      
      // Load messages into chat store
      clearMessages();
      
      // Add each message to the chat store
      chat.messages.forEach((msg) => {
        useChatStore.getState().addMessage({
          role: msg.role,
          content: msg.content,
          model: msg.model,
        });
      });
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!token || !confirm('Delete this chat?')) return;

    try {
      await chatHistoryApi.deleteChat(token, chatId);
      removeChat(chatId);
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const handleUpdateTitle = async (chatId: string) => {
    if (!token || !editTitle.trim()) {
      setEditingId(null);
      return;
    }

    try {
      await chatHistoryApi.updateChatTitle(token, chatId, editTitle);
      useChatHistoryStore.getState().updateChatTitle(chatId, editTitle);
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update title:', error);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 md:hidden bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20"
        size="icon"
      >
        {isSidebarOpen ? <FiX /> : <FiMenu />}
      </Button>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Sidebar Content */}
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-screen w-80 bg-black/40 backdrop-blur-2xl border-r border-white/10 z-40 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleNewChat}
                    disabled={isLoading}
                    className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-700 hover:via-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-300 group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                    <motion.div
                      className="relative flex items-center justify-center"
                      animate={isLoading ? { rotate: 360 } : {}}
                      transition={isLoading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
                    >
                      <FiPlus className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                      {isLoading ? 'Creating...' : 'New Chat'}
                    </motion.div>
                  </Button>
                </motion.div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                <div className="p-2 space-y-1">
                  {chats.length === 0 ? (
                    <div className="text-center py-12 text-white/40">
                      <FiMessageSquare className="mx-auto text-4xl mb-3" />
                      <p className="text-sm">No chats yet</p>
                      <p className="text-xs mt-1">Start a new conversation</p>
                    </div>
                  ) : (
                    chats.map((chat) => (
                      <motion.div
                        key={chat._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        onClick={() => handleSelectChat(chat._id)}
                        className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          currentChatId === chat._id
                            ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        {editingId === chat._id ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => handleUpdateTitle(chat._id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateTitle(chat._id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            className="w-full bg-transparent text-white text-sm outline-none border-b border-purple-500"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">
                                {chat.title}
                              </p>
                              <p className="text-white/40 text-xs mt-1">
                                {new Date(chat.updatedAt).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingId(chat._id);
                                  setEditTitle(chat.title);
                                }}
                                className="p-1.5 hover:bg-white/10 rounded transition-colors"
                              >
                                <FiEdit2 className="w-3.5 h-3.5 text-white/60" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteChat(chat._id, e)}
                                className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                              >
                                <FiTrash2 className="w-3.5 h-3.5 text-red-400/80" />
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10">
                <p className="text-white/40 text-xs text-center">
                  {chats.length} {chats.length === 1 ? 'conversation' : 'conversations'}
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

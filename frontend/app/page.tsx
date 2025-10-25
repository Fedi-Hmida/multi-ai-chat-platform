'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatWindow } from '@/components/ChatWindow';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ModelSelector } from '@/components/ModelSelector';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { FiGithub, FiSettings, FiLogOut, FiUser, FiZap } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useChatHistoryStore } from '@/store/chatHistoryStore';
import { useChatStore } from '@/store/chatStore';
import { chatHistoryApi } from '@/lib/chatHistoryClient';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, token, logout } = useAuthStore();
  const { isSidebarOpen, currentChatId, setCurrentChatId, addChat, chats, setChats } = useChatHistoryStore();
  const { clearMessages, addMessage } = useChatStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // Persistent login + Auto-load chat on mount
  useEffect(() => {
    const initializeChat = async () => {
      if (!isAuthenticated || !token) {
        router.push('/login');
        setIsInitializing(false);
        return;
      }

      try {
        // Fetch user's chats
        const userChats = await chatHistoryApi.getUserChats(token);
        setChats(userChats);

        // Check if we have a persisted currentChatId
        if (currentChatId) {
          // Load the persisted chat
          const chat = await chatHistoryApi.getChatById(token, currentChatId);
          clearMessages();
          chat.messages.forEach((msg) => {
            addMessage({
              role: msg.role,
              content: msg.content,
              model: msg.model,
            });
          });
        } else if (userChats.length > 0) {
          // Load the most recent chat
          const latestChat = userChats[0];
          setCurrentChatId(latestChat._id);
          const chat = await chatHistoryApi.getChatById(token, latestChat._id);
          clearMessages();
          chat.messages.forEach((msg) => {
            addMessage({
              role: msg.role,
              content: msg.content,
              model: msg.model,
            });
          });
        } else {
          // No chats exist - create a default new chat
          const newChat = await chatHistoryApi.createChat(token, 'New Chat');
          setCurrentChatId(newChat._id);
          addChat({
            _id: newChat._id,
            title: newChat.title,
            createdAt: newChat.createdAt,
            updatedAt: newChat.updatedAt,
          });
          clearMessages();
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeChat();
  }, [isAuthenticated, token, router]);

  const handleLogout = () => {
    clearMessages();
    setCurrentChatId(null);
    logout();
    router.push('/login');
  };

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="text-6xl mb-4"
          >
            🤖
          </motion.div>
          <p className="text-white/80 text-lg">Loading your chats...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden flex relative">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Chat Sidebar */}
      <ChatSidebar />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 relative z-10 ${isSidebarOpen ? 'md:ml-80' : 'ml-0'}`}>
        {/* Main content */}
        <div className="relative z-10 flex flex-col h-screen">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="px-4 md:px-6 py-4 border-b border-white/10 backdrop-blur-2xl bg-black/20 shadow-lg"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-3xl cursor-pointer"
                >
                  🤖
                </motion.div>
                <div>
                  <motion.h1 
                    className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    style={{
                      backgroundSize: '200% auto',
                    }}
                  >
                    AI Model Tester
                  </motion.h1>
                  <p className="text-xs md:text-sm text-white/60">
                    Compare responses across multiple AI models
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-4">
              {/* User Info */}
              <motion.div 
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full border border-white/20 backdrop-blur-sm"
                whileHover={{ scale: 1.05, borderColor: 'rgba(255, 255, 255, 0.4)' }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(147, 51, 234, 0)',
                      '0 0 0 4px rgba(147, 51, 234, 0.1)',
                      '0 0 0 0 rgba(147, 51, 234, 0)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm"
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </motion.div>
                <span className="text-sm text-white/90 font-medium">{user?.name}</span>
              </motion.div>

              <ModelSelector />
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <FiSettings className="w-5 h-5" />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                  onClick={() => window.open('https://github.com', '_blank')}
                >
                  <FiGithub className="w-5 h-5" />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <FiLogOut className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Chat area */}
        <motion.main
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 overflow-hidden"
        >
          <ChatWindow />
        </motion.main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="px-4 py-3 border-t border-white/10 backdrop-blur-xl bg-black/10"
        >
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-xs text-white/50">
              Built with Next.js 14, NestJS, MongoDB, Tailwind CSS, and Framer Motion
            </p>
          </div>
        </motion.footer>
      </div>
      </div>
    </div>
  );
}

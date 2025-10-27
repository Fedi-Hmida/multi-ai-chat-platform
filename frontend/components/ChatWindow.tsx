'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import { useChatHistoryStore } from '@/store/chatHistoryStore';
import { useAuthStore } from '@/store/authStore';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { FiSend, FiTrash2, FiDownload } from 'react-icons/fi';
import { sendChatMessage, compareModels } from '@/lib/apiClient';
import { chatHistoryApi } from '@/lib/chatHistoryClient';
import ModelComparisonSelector from './ModelComparisonSelector';
import ComparisonResults from './ComparisonResults';

export const ChatWindow: React.FC = () => {
  const {
    messages,
    selectedModel,
    isTyping,
    setIsTyping,
    addMessage,
    clearMessages,
    exportChat,
    isComparisonMode,
    toggleComparisonMode,
    selectedModelsForComparison,
    comparisonResults,
    isComparing,
    setComparisonResults,
    setIsComparing,
    clearComparisonResults,
  } = useChatStore();

  const { currentChatId, setCurrentChatId, addChat } = useChatHistoryStore();
  const { token } = useAuthStore();

  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Handle editing a prompt from a previous message
  const handleEditPrompt = (content: string) => {
    setInput(content);
    // Focus the input after a brief delay to ensure it's rendered
    setTimeout(() => {
      inputRef.current?.focus();
      // Scroll to the input
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  // Handle editing a message inline and regenerating the response
  const handleEditAndRegenerate = async (messageId: string, newContent: string) => {
    if (!token || !currentChatId) return;

    try {
      // Find the message index
      const messageIndex = messages.findIndex(msg => msg.id === messageId);
      if (messageIndex === -1) return;

      // Remove all messages AFTER the edited message (including the AI response)
      const messagesToKeep = messages.slice(0, messageIndex);
      
      // Clear messages and restore only the ones before the edit
      clearMessages();
      messagesToKeep.forEach(msg => addMessage(msg));
      
      // Add the edited user message
      addMessage({
        role: 'user',
        content: newContent,
      });

      // Save updated user message to backend
      try {
        await chatHistoryApi.addMessage(token, currentChatId, 'user', newContent, selectedModel);
        console.log('✅ Updated user message saved to backend');
      } catch (saveError) {
        console.error('❌ Failed to save updated message:', saveError);
      }

      // Set typing state and regenerate AI response
      setIsTyping(true);

      // Get the updated messages for context (excluding the message we just added since addMessage already added it)
      const conversationHistory = [...messagesToKeep, { 
        id: messageId, 
        role: 'user' as const, 
        content: newContent, 
        timestamp: new Date() 
      }];

      // Send to AI API with updated conversation history
      const response = await sendChatMessage({
        model: selectedModel,
        message: newContent,
        conversationHistory: conversationHistory.slice(-10), // Send last 10 messages for context
      });

      // Add new AI response to UI
      addMessage({
        role: 'assistant',
        content: response.message,
        model: selectedModel,
      });

      // Save new AI response to backend
      try {
        await chatHistoryApi.addMessage(token, currentChatId, 'assistant', response.message, selectedModel);
        console.log('✅ New AI response saved to backend');
      } catch (saveError) {
        console.error('❌ Failed to save AI response:', saveError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate response');
      console.error('Edit and regenerate error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isTyping || !token) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // Handle comparison mode
    if (isComparisonMode) {
      if (selectedModelsForComparison.length < 2) {
        setError('Please select at least 2 models to compare');
        return;
      }
      
      try {
        setIsComparing(true);
        const response = await compareModels(
          {
            prompt: userMessage,
            models: selectedModelsForComparison,
          },
          token
        );
        setComparisonResults(response.responses);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Comparison failed');
        console.error('Comparison error:', err);
      } finally {
        setIsComparing(false);
      }
      return;
    }

    // Regular chat mode
    try {
      // Create a new chat session if one doesn't exist
      let activeChatId = currentChatId;
      if (!activeChatId) {
        const newChat = await chatHistoryApi.createChat(token, userMessage.slice(0, 50));
        activeChatId = newChat._id;
        setCurrentChatId(newChat._id);
        addChat({
          _id: newChat._id,
          title: newChat.title,
          createdAt: newChat.createdAt,
          updatedAt: newChat.updatedAt,
        });
      }

      // Add user message to UI
      addMessage({
        role: 'user',
        content: userMessage,
      });

      // Save user message to backend
      try {
        await chatHistoryApi.addMessage(token, activeChatId, 'user', userMessage, selectedModel);
        console.log('✅ User message saved to backend');
      } catch (saveError) {
        console.error('❌ Failed to save user message:', saveError);
      }

      // Set typing state
      setIsTyping(true);

      // Send to AI API
      const response = await sendChatMessage({
        model: selectedModel,
        message: userMessage,
        conversationHistory: messages.slice(-10), // Send last 10 messages for context
      });

      // Add AI response to UI
      addMessage({
        role: 'assistant',
        content: response.message,
        model: selectedModel,
      });

      // Save AI response to backend
      try {
        await chatHistoryApi.addMessage(token, activeChatId, 'assistant', response.message, selectedModel);
        console.log('✅ AI response saved to backend');
      } catch (saveError) {
        console.error('❌ Failed to save AI response:', saveError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Chat error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExport = () => {
    const data = exportChat();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Comparison Mode Toggle */}
      <div className="px-4 md:px-6 py-3 border-b border-white/10 backdrop-blur-xl bg-black/20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={toggleComparisonMode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300
                flex items-center gap-2
                ${
                  isComparisonMode
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }
              `}
            >
              {isComparisonMode ? (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 bg-green-400 rounded-full"
                  />
                  Compare Mode: ON
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  Enable Comparison Mode
                </>
              )}
            </motion.button>
            
            {isComparisonMode && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-gray-400"
              >
                Compare multiple AI models side-by-side
              </motion.span>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative min-h-0">
        <ScrollArea className="h-full w-full">
          <div className="px-4 md:px-6 py-6 min-h-full">
            <div ref={scrollRef} className="max-w-4xl mx-auto space-y-4">
            {/* Comparison Mode UI */}
            {isComparisonMode && (
              <div className="space-y-4 mb-6">
                <ModelComparisonSelector />
                
                {comparisonResults.length > 0 && (
                  <ComparisonResults 
                    results={comparisonResults}
                    onRerun={() => {
                      if (input.trim()) {
                        handleSend();
                      }
                    }}
                  />
                )}
                
                {isComparing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 rounded-lg border border-white/10">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
                      />
                      <span className="text-white">Comparing models...</span>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Regular Chat Messages */}
            {!isComparisonMode && (
              <>
                {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full min-h-[400px] text-center"
              >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="text-7xl mb-6 filter drop-shadow-2xl"
              >
                💬
              </motion.div>
              <motion.h2 
                className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-3"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                }}
                style={{
                  backgroundSize: '200% auto',
                }}
              >
                Start a Conversation
              </motion.h2>
              <p className="text-white/60 max-w-md text-lg">
                Choose your AI model and start chatting. Compare responses across different models.
              </p>
              <motion.div
                className="mt-8 flex gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {['✨', '🚀', '💡', '🎨'].map((emoji, i) => (
                  <motion.span
                    key={i}
                    className="text-3xl"
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                    }}
                  >
                    {emoji}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          )}

          {messages.map((message, index) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              index={index}
              onEditPrompt={handleEditPrompt}
              onEditAndRegenerate={handleEditAndRegenerate}
            />
          ))}

          <AnimatePresence>
            {isTyping && <TypingIndicator />}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4 text-red-200"
            >
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
          </>
            )}

            {/* Error display for both modes */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4 text-red-200"
              >
                <p className="text-sm">{error}</p>
              </motion.div>
            )}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Action Buttons */}
      {messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 md:px-6 py-3 flex gap-2 justify-end max-w-4xl mx-auto w-full"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleExport}
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300"
            >
              <FiDownload className="mr-2" />
              Export
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={clearMessages}
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-red-400 hover:bg-red-500/20 transition-all duration-300"
            >
              <FiTrash2 className="mr-2" />
              Clear
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Input Area */}
      <div className="px-4 md:px-6 py-4 border-t border-white/10 backdrop-blur-2xl bg-gradient-to-b from-black/20 to-black/40">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <motion.textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={
                  isComparisonMode
                    ? "Ask a question to compare models..."
                    : "Type your message... (Shift + Enter for new line)"
                }
                disabled={isTyping || isComparing}
                rows={1}
                whileFocus={{ scale: 1.01 }}
                className="w-full px-5 py-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none backdrop-blur-xl transition-all duration-300 disabled:opacity-50 shadow-lg"
                style={{ maxHeight: '150px' }}
              />
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping || isComparing || (isComparisonMode && selectedModelsForComparison.length < 2)}
                className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
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
                <FiSend className="w-5 h-5 relative z-10 group-hover:rotate-45 transition-transform duration-300" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

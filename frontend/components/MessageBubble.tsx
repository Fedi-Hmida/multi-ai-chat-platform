'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { FiUser, FiCpu } from 'react-icons/fi';

interface MessageBubbleProps {
  message: Message;
  index: number;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, index }) => {
  const isUser = message.role === 'user';
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.21, 1.02, 0.73, 1],
      }}
      className={cn(
        'flex gap-3 mb-4 group',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg',
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-purple-600'
            : 'bg-gradient-to-br from-emerald-500 to-teal-600'
        )}
      >
        {isUser ? <FiUser size={18} /> : <FiCpu size={18} />}
      </motion.div>

      {/* Message Content */}
      <div className={cn('flex flex-col max-w-[75%]', isUser ? 'items-end' : 'items-start')}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={cn(
            'rounded-2xl px-5 py-3 shadow-xl backdrop-blur-xl border transition-all duration-300',
            isUser
              ? 'bg-gradient-to-br from-blue-500/90 to-purple-600/90 text-white border-blue-400/20 hover:shadow-blue-500/25'
              : 'bg-white/10 text-white border-white/10 hover:shadow-emerald-500/25 hover:bg-white/15'
          )}
        >
          <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </motion.div>
        
        {/* Timestamp */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="text-xs text-white/50 mt-1 px-2"
        >
          {formatTime(message.timestamp)}
          {message.model && !isUser && (
            <span className="ml-2 text-emerald-400/70">• {message.model}</span>
          )}
        </motion.span>
      </div>
    </motion.div>
  );
};

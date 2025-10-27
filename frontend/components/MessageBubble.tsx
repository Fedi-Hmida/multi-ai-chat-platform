'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { FiUser, FiCpu } from 'react-icons/fi';
import { MessageToolbar } from './MessageToolbar';
import { copyToClipboard, exportResponse } from '@/lib/exportClient';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';

interface MessageBubbleProps {
  message: Message;
  index: number;
  onEditPrompt?: (content: string) => void;
  onEditAndRegenerate?: (messageId: string, newContent: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  index, 
  onEditPrompt, 
  onEditAndRegenerate 
}) => {
  const isUser = message.role === 'user';
  const [showToolbar, setShowToolbar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const { token } = useAuthStore();
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      toast.success('✅ Copied to clipboard!', {
        duration: 2000,
        position: 'bottom-center',
      });
    } else {
      toast.error('Failed to copy', {
        duration: 2000,
        position: 'bottom-center',
      });
    }
  };

  const handleEdit = () => {
    if (isUser) {
      // For user messages, enable inline editing
      setIsEditing(true);
      setEditedContent(message.content);
    }
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() && onEditAndRegenerate) {
      onEditAndRegenerate(message.id, editedContent.trim());
      setIsEditing(false);
      toast.success('✅ Message updated, regenerating response...', {
        duration: 2000,
        position: 'bottom-center',
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(message.content);
  };

  const handleExport = async (format: 'pdf' | 'markdown' | 'json' | 'text') => {
    if (!token) {
      toast.error('Please log in to export', {
        duration: 2000,
        position: 'bottom-center',
      });
      return;
    }

    try {
      toast.loading(`Exporting as ${format.toUpperCase()}...`, {
        duration: 1000,
        position: 'bottom-center',
      });

      await exportResponse(token, {
        format,
        response: message.content,
        model: message.model,
      });

      toast.success(`✅ Exported as ${format.toUpperCase()}!`, {
        duration: 3000,
        position: 'bottom-center',
      });
    } catch (error) {
      toast.error('Export failed. Please try again.', {
        duration: 3000,
        position: 'bottom-center',
      });
    }
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
      onMouseEnter={() => !isUser && setShowToolbar(true)}
      onMouseLeave={() => setShowToolbar(false)}
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
      <div 
        className={cn('flex flex-col max-w-[75%]', isUser ? 'items-end' : 'items-start')}
        onMouseEnter={() => setShowToolbar(true)}
        onMouseLeave={() => setShowToolbar(false)}
      >
        <div className="relative w-full">
          <motion.div
            whileHover={{ scale: isEditing ? 1 : 1.01 }}
            className={cn(
              'rounded-2xl px-5 py-3 shadow-xl backdrop-blur-xl border transition-all duration-300',
              isUser
                ? 'bg-gradient-to-br from-blue-500/90 to-purple-600/90 text-white border-blue-400/20 hover:shadow-blue-500/25'
                : 'bg-white/10 text-white border-white/10 hover:shadow-emerald-500/25 hover:bg-white/15'
            )}
          >
            {isEditing ? (
              // Edit Mode - Textarea with Save/Cancel buttons
              <div className="space-y-3">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full bg-white/10 text-white rounded-lg px-3 py-2 text-sm md:text-base leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-400/50 min-h-[100px]"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleSaveEdit();
                    } else if (e.key === 'Escape') {
                      handleCancelEdit();
                    }
                  }}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    Cancel (Esc)
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1.5 text-xs rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors font-medium"
                  >
                    Save & Regenerate (Ctrl+Enter)
                  </button>
                </div>
              </div>
            ) : (
              // Display Mode - Normal message
              <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            )}
          </motion.div>
        
          {/* Toolbar - positioned absolutely in top right corner of message */}
          {!isEditing && (
            <div className={cn(
              'absolute -top-2 z-10 transition-opacity duration-200',
              isUser ? '-left-2' : '-right-2',
              showToolbar ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}>
              <MessageToolbar
                messageContent={message.content}
                messageId={message.id}
                onCopy={handleCopy}
                onEdit={handleEdit}
                onExport={handleExport}
                isVisible={showToolbar}
                showCopyExport={!isUser}
                showEdit={isUser}
              />
            </div>
          )}
        </div>
        
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

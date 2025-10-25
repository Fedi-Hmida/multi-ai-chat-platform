'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AVAILABLE_MODELS } from '@/config/models';
import { useChatStore } from '@/store/chatStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FiCpu } from 'react-icons/fi';

export const ModelSelector: React.FC = () => {
  const { selectedModel, setSelectedModel } = useChatStore();

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-3"
    >
      <motion.div 
        className="flex items-center gap-2 text-white/80"
        animate={{
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <FiCpu className="w-5 h-5" />
        </motion.div>
        <span className="text-sm font-medium hidden sm:block">Model:</span>
      </motion.div>
      
      <Select value={selectedModel} onValueChange={setSelectedModel}>
        <SelectTrigger className="w-[200px] sm:w-[240px] bg-gradient-to-r from-white/10 to-white/5 border-white/20 text-white backdrop-blur-xl hover:bg-white/15 hover:border-white/40 transition-all duration-300 shadow-lg">
          <SelectValue>
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {currentModel?.icon}
              </motion.span>
              <span className="font-medium">{currentModel?.name}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-gray-900/98 border-white/20 backdrop-blur-2xl shadow-2xl">
          {AVAILABLE_MODELS.map((model, index) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <SelectItem
                value={model.id}
                className="text-white hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-blue-500/20 focus:bg-gradient-to-r focus:from-purple-500/20 focus:to-blue-500/20 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-3 py-1">
                  <span className="text-xl">{model.icon}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{model.name}</span>
                    <span className="text-xs text-white/60">{model.description}</span>
                  </div>
                </div>
              </SelectItem>
            </motion.div>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  );
};

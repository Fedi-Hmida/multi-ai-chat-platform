'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const TypingIndicator: React.FC = () => {
  const dotVariants = {
    initial: { y: 0, scale: 1 },
    animate: { 
      y: -10,
      scale: [1, 1.2, 1],
    },
  };

  const dotTransition = {
    duration: 0.6,
    repeat: Infinity,
    repeatType: 'reverse' as const,
    ease: 'easeInOut' as const,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex gap-3 mb-4"
    >
      {/* AI Avatar */}
      <motion.div 
        className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg"
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(16, 185, 129, 0.4)',
            '0 0 0 8px rgba(16, 185, 129, 0)',
            '0 0 0 0 rgba(16, 185, 129, 0)',
          ],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      >
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-lg"
        >
          ⚙️
        </motion.span>
      </motion.div>

      {/* Typing Animation */}
      <motion.div 
        className="rounded-2xl px-6 py-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-xl"
        animate={{
          borderColor: ['rgba(255, 255, 255, 0.2)', 'rgba(16, 185, 129, 0.4)', 'rgba(255, 255, 255, 0.2)'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        <div className="flex gap-2 items-center">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              variants={dotVariants}
              initial="initial"
              animate="animate"
              transition={{
                ...dotTransition,
                delay: index * 0.2,
              }}
              className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 shadow-lg shadow-emerald-500/50"
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

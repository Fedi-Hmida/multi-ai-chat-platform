'use client';

import { motion } from 'framer-motion';
import { AVAILABLE_MODELS } from '@/config/models';
import { useChatStore } from '@/store/chatStore';

export default function ModelComparisonSelector() {
  const { selectedModelsForComparison, setSelectedModelsForComparison } = useChatStore();

  const toggleModel = (modelId: string) => {
    if (selectedModelsForComparison.includes(modelId)) {
      setSelectedModelsForComparison(
        selectedModelsForComparison.filter((id) => id !== modelId)
      );
    } else {
      setSelectedModelsForComparison([...selectedModelsForComparison, modelId]);
    }
  };

  const availableModels = AVAILABLE_MODELS;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">
          Select Models to Compare
        </h3>
        <span className="text-xs text-gray-400">
          {selectedModelsForComparison.length} selected
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {availableModels.map((model) => {
          const isSelected = selectedModelsForComparison.includes(model.id);
          
          return (
            <motion.button
              key={model.id}
              onClick={() => toggleModel(model.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative p-3 rounded-lg border transition-all duration-200
                ${
                  isSelected
                    ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/20'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }
              `}
            >
              {/* Checkbox */}
              <div className="flex items-start gap-3">
                <div
                  className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center
                    transition-all duration-200
                    ${
                      isSelected
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-white/30'
                    }
                  `}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>

                {/* Model Info */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{model.icon}</span>
                    <span className="text-sm font-medium text-white">
                      {model.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {model.description}
                  </p>
                </div>
              </div>

              {/* Selection glow effect */}
              {isSelected && (
                <motion.div
                  layoutId="selection-glow"
                  className="absolute inset-0 bg-blue-500/10 rounded-lg pointer-events-none"
                  transition={{ type: 'spring', duration: 0.3 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {selectedModelsForComparison.length < 2 && (
        <p className="text-xs text-yellow-400/80 mt-3 text-center">
          ⚠️ Select at least 2 models to compare
        </p>
      )}
    </motion.div>
  );
}

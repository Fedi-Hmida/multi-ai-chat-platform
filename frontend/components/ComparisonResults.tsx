'use client';

import { motion } from 'framer-motion';
import { ComparisonResponse } from '@/lib/apiClient';
import { getModelById } from '@/config/models';
import { useState } from 'react';

interface ComparisonResultsProps {
  results: ComparisonResponse[];
  onRerun?: () => void;
}

export default function ComparisonResults({ results, onRerun }: ComparisonResultsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Comparison Results
        </h3>
        {onRerun && (
          <button
            onClick={onRerun}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 
                     border border-blue-500/30 rounded-lg text-sm text-white transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Re-run Comparison
          </button>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result, index) => {
          const modelInfo = getModelById(result.model);
          const hasError = !!result.error;

          return (
            <motion.div
              key={`${result.model}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.1,
                type: 'spring',
                stiffness: 100 
              }}
              className={`
                relative bg-white/5 backdrop-blur-sm border rounded-lg overflow-hidden
                ${hasError ? 'border-red-500/30' : 'border-white/10'}
                hover:border-white/20 transition-all duration-300
              `}
            >
              {/* Model Header */}
              <div className={`
                p-4 border-b border-white/10
                ${modelInfo ? `bg-gradient-to-r ${modelInfo.color} bg-opacity-10` : 'bg-white/5'}
              `}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{modelInfo?.icon || '🤖'}</span>
                    <div>
                      <h4 className="font-semibold text-white">
                        {modelInfo?.name || result.model}
                      </h4>
                      {result.responseTime && (
                        <p className="text-xs text-gray-400">
                          {(result.responseTime / 1000).toFixed(2)}s
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Copy Button */}
                  {!hasError && (
                    <button
                      onClick={() => copyToClipboard(result.text, index)}
                      className="p-2 hover:bg-white/10 rounded transition-colors"
                      title="Copy response"
                    >
                      {copiedIndex === index ? (
                        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Response Content */}
              <div className="p-4">
                {hasError ? (
                  <div className="flex items-start gap-2 text-red-400">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">{result.error}</p>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {result.text}
                    </p>
                  </div>
                )}
              </div>

              {/* Decorative gradient border on hover */}
              <motion.div
                className="absolute inset-0 opacity-0 pointer-events-none"
                whileHover={{ opacity: 0.1 }}
                style={{
                  background: modelInfo
                    ? `linear-gradient(135deg, ${modelInfo.color})`
                    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5))',
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

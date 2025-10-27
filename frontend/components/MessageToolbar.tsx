'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCopy, FiEdit2, FiDownload, FiCheck } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface ExportFormat {
  id: 'pdf' | 'markdown' | 'json' | 'text';
  label: string;
  icon: string;
}

const EXPORT_FORMATS: ExportFormat[] = [
  { id: 'markdown', label: 'Markdown', icon: '📝' },
  { id: 'pdf', label: 'PDF', icon: '📄' },
  { id: 'json', label: 'JSON', icon: '📋' },
  { id: 'text', label: 'Plain Text', icon: '📃' },
];

interface MessageToolbarProps {
  messageContent: string;
  messageId: string;
  onCopy: () => void;
  onEdit: () => void;
  onExport: (format: 'pdf' | 'markdown' | 'json' | 'text') => void;
  isVisible?: boolean;
  showCopyExport?: boolean; // Show copy and export buttons (for AI messages)
  showEdit?: boolean; // Show edit button (for user messages)
}

export const MessageToolbar: React.FC<MessageToolbarProps> = ({
  messageContent,
  messageId,
  onCopy,
  onEdit,
  onExport,
  isVisible = true,
  showCopyExport = true,
  showEdit = false,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Check position when opening dropdown
  const handleToggleExport = () => {
    if (!showExportMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Dropdown height is approximately 240px, so we need at least 260px space
      // If there's not enough space below, open upward
      if (spaceBelow < 280) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
    setShowExportMenu(!showExportMenu);
  };

  const handleCopy = async () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async (format: 'pdf' | 'markdown' | 'json' | 'text') => {
    setExporting(true);
    setShowExportMenu(false);
    await onExport(format);
    setExporting(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-0.5 bg-gray-900/95 backdrop-blur-xl rounded-lg border border-white/20 shadow-2xl p-1"
        >
          {/* Copy Button - only for AI messages */}
          {showCopyExport && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              className={cn(
                'p-1.5 rounded-md transition-all duration-200',
                'hover:bg-white/20',
                copied ? 'text-green-400' : 'text-white/70 hover:text-white'
              )}
              title="Copy"
            >
              {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
            </motion.button>
          )}

          {/* Edit Button - only for user messages */}
          {showEdit && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onEdit}
              className={cn(
                'p-1.5 rounded-md transition-all duration-200',
                'hover:bg-white/20 text-white/70 hover:text-white'
              )}
              title="Edit"
            >
              <FiEdit2 size={14} />
            </motion.button>
          )}

          {/* Export Button with Dropdown - only for AI messages */}
          {showCopyExport && (
            <div className="relative">
              <motion.button
                ref={buttonRef}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleExport}
                disabled={exporting}
                className={cn(
                  'p-1.5 rounded-md transition-all duration-200',
                  'hover:bg-white/20 text-white/70 hover:text-white',
                  exporting && 'opacity-50 cursor-not-allowed'
                )}
                title="Export"
              >
                <FiDownload size={14} className={exporting ? 'animate-pulse' : ''} />
              </motion.button>

              {/* Export Dropdown */}
              <AnimatePresence>
                {showExportMenu && (
                  <>
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-10"
                      onClick={() => setShowExportMenu(false)}
                    />

                    {/* Dropdown Menu */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: dropdownPosition === 'bottom' ? 5 : -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: dropdownPosition === 'bottom' ? 5 : -5 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        'absolute right-0 z-20 w-[180px]',
                        'rounded-xl backdrop-blur-2xl border shadow-2xl',
                        'bg-gray-900/98 border-white/30',
                        'overflow-hidden',
                        dropdownPosition === 'bottom' ? 'top-10' : 'bottom-10'
                      )}
                    >
                      <div className="p-2 space-y-1">
                        {EXPORT_FORMATS.map((format) => (
                          <motion.button
                            key={format.id}
                            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleExport(format.id)}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
                              'text-left text-sm font-medium transition-all duration-150',
                              'text-white/90 hover:text-white',
                              'hover:shadow-lg'
                            )}
                          >
                            <span className="text-lg flex-shrink-0">{format.icon}</span>
                            <span className="flex-1">{format.label}</span>
                          </motion.button>
                        ))}
                      </div>
                      
                      {/* Arrow pointer */}
                      <div 
                        className={cn(
                          'absolute right-3 w-3 h-3 bg-gray-900/98 border border-white/30 transform rotate-45',
                          dropdownPosition === 'bottom' 
                            ? '-top-1 border-r-0 border-b-0' 
                            : '-bottom-1 border-l-0 border-t-0'
                        )}
                      />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

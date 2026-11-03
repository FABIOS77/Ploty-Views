import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { bentoSpringTransition } from './motion-skills';

interface StackedDeckCardProps {
  title: string;
  tabColor: '#F66554' | '#F9CD61' | '#7477FF' | string;
  tabLabel?: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  className?: string;
}

export const StackedDeckCard: React.FC<StackedDeckCardProps> = ({
  title,
  tabColor,
  tabLabel,
  defaultExpanded = true,
  children,
  headerAction,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <motion.div
      layout
      transition={bentoSpringTransition}
      className={`rounded-3xl border-2 border-ploty-charcoal bg-ploty-white shadow-tactile overflow-hidden ${className}`}
    >
      {/* Top Deck Tab */}
      <div
        style={{ backgroundColor: tabColor }}
        className="px-6 py-2.5 flex items-center justify-between border-b-2 border-ploty-charcoal cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {tabLabel && (
            <span className="text-xs font-black uppercase tracking-wider bg-ploty-charcoal text-ploty-white px-2.5 py-0.5 rounded-full">
              {tabLabel}
            </span>
          )}
          <span className="font-extrabold text-sm text-ploty-charcoal">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {headerAction}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-ploty-charcoal" />
          </motion.div>
        </div>
      </div>

      {/* Body */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={bentoSpringTransition}
            className="p-6"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

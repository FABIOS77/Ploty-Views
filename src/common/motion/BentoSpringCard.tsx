import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { bentoCardVariants } from './motion-skills';

interface BentoSpringCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'charcoal' | 'white' | 'periwinkle' | 'coral' | 'gold' | 'sage';
}

const variantStyles: Record<string, string> = {
  charcoal: 'bg-ploty-charcoal text-ploty-white border-2 border-ploty-charcoal shadow-tactile',
  white: 'bg-ploty-white text-ploty-charcoal border-2 border-ploty-charcoal shadow-tactile',
  periwinkle: 'bg-ploty-periwinkle text-ploty-white border-2 border-ploty-charcoal shadow-tactile',
  coral: 'bg-ploty-coral text-ploty-white border-2 border-ploty-charcoal shadow-tactile',
  gold: 'bg-ploty-gold text-ploty-charcoal border-2 border-ploty-charcoal shadow-tactile',
  sage: 'bg-ploty-sage text-ploty-charcoal border-2 border-ploty-charcoal shadow-tactile',
};

export const BentoSpringCard: React.FC<BentoSpringCardProps> = ({
  children,
  className = '',
  variant = 'white',
  ...props
}) => {
  return (
    <motion.div
      variants={bentoCardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      className={`rounded-3xl p-6 transition-colors duration-150 relative overflow-hidden ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

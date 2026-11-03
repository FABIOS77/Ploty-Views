import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { staggerContainerVariants, staggerItemVariants } from './motion-skills';

interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

interface StaggerItemProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <motion.div variants={staggerItemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
};

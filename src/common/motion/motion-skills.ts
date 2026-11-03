import type { Variants } from 'framer-motion';

/**
 * Spring physics configuration for tactile bento cards
 */
export const bentoSpringTransition = {
  type: 'spring',
  stiffness: 320,
  damping: 24,
  mass: 0.8,
} as const;

export const springConfig = {
  tactile: { type: 'spring', stiffness: 320, damping: 24, mass: 0.8 },
  bouncy: { type: 'spring', stiffness: 400, damping: 15, mass: 0.6 },
} as const;

/**
 * Skill 1: BentoSpringCard animation variants
 */
export const bentoCardVariants: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: bentoSpringTransition,
  },
  hover: {
    y: -4,
    scale: 1.01,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  tap: {
    scale: 0.98,
    y: 0,
    transition: { duration: 0.1 },
  },
};

/**
 * Skill 2: StaggerContainer & StaggerItem variants
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: bentoSpringTransition,
  },
};

/**
 * Skill 3: StackedDeckTransition variants
 */
export const stackedDeckVariants: Variants = {
  collapsed: {
    height: 72,
    opacity: 0.9,
    transition: bentoSpringTransition,
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: bentoSpringTransition,
  },
};

/**
 * Float & pulse animation for XP badges & streaks
 */
export const floatBadgeVariants: Variants = {
  idle: {
    y: [0, -3, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

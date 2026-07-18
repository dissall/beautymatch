import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export default function Card({ children, className = '', delay = 0, hover = true }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={hover ? { y: -4, boxShadow: '0 20px 40px rgba(244, 114, 182, 0.15)' } : undefined}
      className={`
        bg-white rounded-3xl p-6
        shadow-lg shadow-pink-100/50
        border border-pink-50
        transition-shadow duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

'use client';
import { motion } from 'framer-motion';

export default function GlassCard({ 
  children, 
  className = '', 
  hover = true,
  glow = false,
  glowColor = 'rgba(45, 212, 191, 0.2)',
  padding = '32px 28px',
  ...props 
}) {
  return (
    <motion.div
      className={`glass-card ${glow ? 'glass-card-glow' : ''} ${className}`}
      whileHover={hover ? { 
        y: -6, 
        scale: 1.015,
        borderColor: 'rgba(30, 230, 199, 0.52)',
        boxShadow: glow 
          ? `0 20px 60px -15px ${glowColor}, 0 0 30px ${glowColor}`
          : '0 20px 60px -20px rgba(2, 5, 12, 0.74)',
      } : undefined}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ '--card-padding': padding }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

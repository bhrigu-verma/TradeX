'use client';
import { motion } from 'framer-motion';

export default function FadeIn({ 
  children, 
  delay = 0, 
  direction = 'up', 
  duration = 0.6, 
  className = '',
  once = true,
  amount = 0.3 
}) {
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
    none: { x: 0, y: 0 },
  };

  const d = directions[direction] || directions.up;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: d.x, y: d.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount }}
      transition={{ 
        duration, 
        delay, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
    >
      {children}
    </motion.div>
  );
}

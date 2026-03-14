'use client';
import { motion } from 'framer-motion';

export default function FloatingOrbs() {
  const orbs = [
    { size: 520, x: '12%', y: '18%', color: 'rgba(56, 189, 248, 0.09)', delay: 0, duration: 24 },
    { size: 420, x: '78%', y: '63%', color: 'rgba(45, 212, 191, 0.08)', delay: 2, duration: 29 },
    { size: 300, x: '54%', y: '82%', color: 'rgba(156, 200, 255, 0.06)', delay: 4, duration: 21 },
    { size: 260, x: '86%', y: '14%', color: 'rgba(250, 204, 21, 0.05)', delay: 1, duration: 26 },
    { size: 360, x: '32%', y: '52%', color: 'rgba(125, 229, 212, 0.07)', delay: 3, duration: 32 },
  ];

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      pointerEvents: 'none', 
      zIndex: 0,
      overflow: 'hidden',
    }}>
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, 24, -18, 12, 0],
            y: [0, -20, 16, -8, 0],
            scale: [1, 1.08, 0.96, 1.03, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

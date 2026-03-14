'use client';
import { motion } from 'framer-motion';

export default function GlowButton({ 
  children, 
  href, 
  variant = 'primary', 
  size = 'md',
  className = '',
  onClick,
  icon,
  ...props 
}) {
  const sizes = {
    sm: { padding: '10px 20px', fontSize: '14px' },
    md: { padding: '14px 28px', fontSize: '16px' },
    lg: { padding: '18px 36px', fontSize: '18px' },
  };

  const s = sizes[size] || sizes.md;

  const Component = href ? motion.a : motion.button;

  return (
    <Component
      href={href}
      onClick={onClick}
      className={`glow-btn glow-btn-${variant} ${className}`}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      style={{
        padding: s.padding,
        fontSize: s.fontSize,
      }}
      {...props}
    >
      {icon && <span className="glow-btn-icon">{icon}</span>}
      {children}
    </Component>
  );
}

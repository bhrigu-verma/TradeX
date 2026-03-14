'use client';
import { motion } from 'framer-motion';

export default function SectionHeading({ 
  badge, 
  title, 
  subtitle, 
  align = 'center',
  className = '' 
}) {
  return (
    <div className={className} style={{ textAlign: align, marginBottom: 60, position: 'relative', zIndex: 1 }}>
      {badge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'inline-block',
            background: 'rgba(15, 23, 42, 0.7)',
            color: '#b8d7ff',
            padding: '7px 18px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 18,
            border: '1px solid rgba(148, 163, 184, 0.35)',
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
          }}
        >
          {badge}
        </motion.div>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          fontSize: 'clamp(28px, 4vw, 48px)',
          fontWeight: 800,
          color: '#f8fbff',
          margin: '0 0 14px',
          letterSpacing: '-0.035em',
          lineHeight: 1.15,
        }}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            fontSize: 18,
            color: 'rgba(222, 235, 255, 0.76)',
            lineHeight: 1.6,
            maxWidth: align === 'center' ? 640 : 'none',
            margin: align === 'center' ? '0 auto' : 0,
          }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

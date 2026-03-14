'use client';
import { useEffect, useRef, useState } from 'react';
import { useInView, motion } from 'framer-motion';

export default function AnimatedCounter({ 
  target, 
  suffix = '', 
  prefix = '',
  duration = 2,
  className = '' 
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const numericTarget = parseInt(target.toString().replace(/[^0-9]/g, ''), 10);
    if (isNaN(numericTarget) || numericTarget === 0) {
      return;
    }

    let startTime;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * numericTarget));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target, duration]);

  const display = typeof target === 'string' && isNaN(parseInt(target.replace(/[^0-9]/g, '')))
    ? target
    : `${prefix}${count.toLocaleString()}${suffix}`;

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.3 }}
    >
      {display}
    </motion.span>
  );
}

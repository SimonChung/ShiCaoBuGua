import React from 'react';
import { motion } from 'framer-motion';

export function YarrowStick({
  id,
  isHighlighted = false,
  isHung = false,
  height = 96,
  width = 6,
  tilt = 0,
  className = '',
}) {
  return (
    <motion.div
      layoutId={id !== undefined ? `stick-${id}` : undefined}
      layout
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: tilt ? `rotate(${tilt}deg)` : undefined,
      }}
      className={`rounded-full shrink-0 select-none transition-colors duration-200 ${
        isHighlighted
          ? 'bg-gradient-to-b from-amber-200 via-gold to-amber-500 shadow-[0_0_8px_rgba(240,213,140,0.8)] border border-amber-200'
          : isHung
          ? 'bg-gradient-to-b from-emerald-200 via-jade to-emerald-700 shadow-[0_0_6px_rgba(95,179,154,0.6)] border border-emerald-300/40'
          : 'bg-gradient-to-b from-[#dfcaa0] via-[#c9b07a] to-[#8a7444] border-x border-[#7a6438] shadow-sm'
      } ${className}`}
    />
  );
}

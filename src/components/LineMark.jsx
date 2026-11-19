import React from 'react';
import { motion } from 'framer-motion';

export function LineMark({ value, size = 20 }) {
  if (value === 9) {
    // 老陽：紅色圓圈 ○
    return (
      <div
        className="inline-flex items-center justify-center select-none"
        title="老陽（太陽，9）：變爻，陽變陰"
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#e0524a"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_4px_rgba(224,82,74,0.6)]"
        >
          <motion.circle
            cx="12"
            cy="12"
            r="9"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
      </div>
    );
  }

  if (value === 6) {
    // 老陰：綠色叉叉 ✕
    return (
      <div
        className="inline-flex items-center justify-center select-none"
        title="老陰（太陰，6）：變爻，陰變陽"
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4cc26b"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_4px_rgba(76,194,107,0.6)]"
        >
          <motion.line
            x1="5"
            y1="5"
            x2="19"
            y2="19"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          />
          <motion.line
            x1="19"
            y1="5"
            x2="5"
            y2="19"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.25, delay: 0.2, ease: 'easeOut' }}
          />
        </svg>
      </div>
    );
  }

  return null;
}

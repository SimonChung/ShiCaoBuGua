import React, { useRef, useState } from 'react';
import { clampSplit } from '../core/yarrow.js';

const BUNDLE_CENTER = 46;
const MIN_DRAG = 12; // CSS px，避免輕點或手指微晃就分草

export function YarrowTable({ total, onSplit, left, caption, afterHang = false }) {
  const gesture = useRef(null);
  const [preview, setPreview] = useState(null);
  const isSeparated = left != null;

  function startDrag(event) {
    if (!event.isPrimary || event.button !== 0 || gesture.current) return;
    const target = event.currentTarget;
    const bounds = target.getBoundingClientRect();
    const fraction = (event.clientX - bounds.left) / bounds.width;
    const drag = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      left: clampSplit(fraction * total, total),
      maxOffset: target.parentElement.getBoundingClientRect().right - bounds.right - 12,
    };
    target.setPointerCapture(event.pointerId);
    gesture.current = drag;
    setPreview({ left: drag.left, offset: 0 });
  }

  function moveDrag(event) {
    const drag = gesture.current;
    if (drag?.id !== event.pointerId) return;
    const offset = Math.min(drag.maxOffset, Math.max(0, event.clientX - drag.startX));
    setPreview({ left: drag.left, offset });
  }

  function finishDrag(event) {
    const drag = gesture.current;
    if (drag?.id !== event.pointerId) return;
    gesture.current = null;
    setPreview(null);
    const dx = event.clientX - drag.startX;
    if (dx >= MIN_DRAG && dx > Math.abs(event.clientY - drag.startY)) {
      onSplit(drag.left);
    }
  }

  function cancelDrag(event) {
    if (gesture.current?.id !== event.pointerId) return;
    gesture.current = null;
    setPreview(null);
  }

  return (
    <figure className="w-full max-w-xl">
      <div className={`yarrow-table ${isSeparated ? 'is-separated' : ''}`}>
        {Array.from({ length: total }, (_, i) => {
          // 中線處的枝序固定，按住的位置就是左右兩把的分界。
          let center = BUNDLE_CENTER;
          let rank = i + 0.5 - total / 2;
          if (isSeparated && i < left) {
            center = 25;
            rank = i + 0.5 - left / 2;
          } else if (isSeparated) {
            center = 75;
            rank = i - left + 0.5 - (total - left) / 2;
          }
          const offset = preview && i >= preview.left ? preview.offset : 0;
          return (
            <span
              key={i}
              aria-hidden="true"
              className="table-stalk"
              style={{
                left: `calc(${center}% + ${rank} * var(--stalk-spacing) + ${offset}px)`,
                top: `${46 + 4 * Math.sin(i * 2.18)}%`,
                height: `${65 + 5 * Math.cos(i * 1.91)}%`,
                '--tilt': `${rank * 0.33 + 4 * Math.sin(i * 1.57) - 3}deg`,
                '--joint': `${29 + ((i * 11) % 44)}%`,
                '--hue': `${34 + ((i * 7) % 10)}`,
              }}
            />
          );
        })}
        {onSplit && (
          <div
            className={`bundle-grip ${preview ? 'is-dragging' : ''}`}
            style={{ left: `${BUNDLE_CENTER}%`, width: `calc(${total} * var(--stalk-spacing))` }}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={finishDrag}
            onPointerCancel={cancelDrag}
            onLostPointerCapture={cancelDrag}
          />
        )}
        {isSeparated && (
          <div className="pile-counts">
            <span>左堆 {left} 枝</span>
            <span>{afterHang ? '掛一後右堆' : '右堆'} {total - left} 枝</span>
          </div>
        )}
      </div>
      {caption && <figcaption className="mt-3 text-center text-sm font-serif text-paper">{caption}</figcaption>}
    </figure>
  );
}

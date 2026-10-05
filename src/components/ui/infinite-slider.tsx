'use client';

import React, { useState, useEffect } from 'react';
import { useMotionValue, animate, motion } from 'framer-motion';
import useMeasure from 'react-use-measure';
import { cn } from '@/lib/utils';

export type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  direction?: 'horizontal' | 'vertical';
  reverse?: boolean;
  className?: string;
};

export function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  durationOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [currentDuration, setCurrentDuration] = useState(duration);
  const [ref, { width, height }] = useMeasure();
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);

  const isHorizontal = direction === 'horizontal';
  const size = isHorizontal ? width : height;
  const contentSize = size > 0 ? size + gap : 0;

  useEffect(() => {
    if (contentSize <= 0) return;

    let controls: { stop: () => void } | undefined;
    const from = reverse ? -contentSize : 0;
    const to = reverse ? 0 : -contentSize;

    if (isTransitioning) {
      const currentPos = translation.get();
      const distance = Math.abs(currentPos - to);
      const remainingDuration =
        (currentDuration * (distance || contentSize)) / contentSize;

      controls = animate(translation, [currentPos, to], {
        ease: 'linear',
        duration: remainingDuration,
        onComplete: () => {
          setIsTransitioning(false);
          translation.set(from);
          setKey((prevKey) => prevKey + 1);
        },
      });
    } else {
      controls = animate(translation, [from, to], {
        ease: 'linear',
        duration: currentDuration,
        repeat: Infinity,
        repeatType: 'loop',
        repeatDelay: 0,
        onRepeat: () => {
          translation.set(from);
        },
      });
    }

    return () => controls?.stop();
  }, [
    key,
    translation,
    currentDuration,
    contentSize,
    isTransitioning,
    reverse,
  ]);

  const hoverProps = durationOnHover
    ? {
        onHoverStart: () => {
          setIsTransitioning(true);
          setCurrentDuration(durationOnHover);
        },
        onHoverEnd: () => {
          setIsTransitioning(true);
          setCurrentDuration(duration);
        },
      }
    : {};

  return (
    <div
      dir="ltr"
      className={cn('overflow-hidden w-full select-none', className)}
    >
      <motion.div
        className="flex w-max"
        style={{
          ...(isHorizontal
            ? { x: translation }
            : { y: translation }),
          gap: `${gap}px`,
          flexDirection: isHorizontal ? 'row' : 'column',
        }}
        {...hoverProps}
      >
        {/* Track 1: Measured */}
        <div
          ref={ref}
          className="flex shrink-0"
          style={{
            gap: `${gap}px`,
            flexDirection: isHorizontal ? 'row' : 'column',
          }}
        >
          {children}
        </div>

        {/* Track 2: Seamless Clone */}
        <div
          className="flex shrink-0"
          aria-hidden="true"
          style={{
            gap: `${gap}px`,
            flexDirection: isHorizontal ? 'row' : 'column',
          }}
        >
          {children}
        </div>

        {/* Track 3: Wide Screen Buffer */}
        <div
          className="flex shrink-0"
          aria-hidden="true"
          style={{
            gap: `${gap}px`,
            flexDirection: isHorizontal ? 'row' : 'column',
          }}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export default InfiniteSlider;

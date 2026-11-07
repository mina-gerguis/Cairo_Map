'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { 
    opacity: 0,
    y: 30
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.43, 0.13, 0.23, 0.96],
      delayChildren: 0.1,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  }
};

const numberVariants = {
  hidden: (direction: number) => ({
    opacity: 0,
    x: direction * 40,
    y: 15,
    rotate: direction * 5
  }),
  visible: {
    opacity: 0.7,
    x: 0,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.8,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  }
};

const ghostVariants = {
  hidden: { 
    scale: 0.8,
    opacity: 0,
    y: 15,
    rotate: -5
  },
  visible: { 
    scale: 1,
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  },
  hover: {
    scale: 1.1,
    y: -10,
    rotate: [0, -5, 5, -5, 0],
    transition: {
      duration: 0.8,
      ease: "easeInOut",
      rotate: {
        duration: 2,
        ease: "linear",
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  },
  floating: {
    y: [-5, 5],
    transition: {
      y: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  }
};

interface PlacesNotFoundProps {
  categoryLabel?: string;
  onReset?: () => void;
}

export function PlacesNotFound({ categoryLabel, onReset }: PlacesNotFoundProps) {
  return (
    <div className="w-full py-16 px-4 flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div 
          className="text-center max-w-lg mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-8 md:mb-10">
            <motion.span 
              className="text-[75px] md:text-[110px] font-bold text-neutral-800 dark:text-neutral-100 opacity-70 select-none leading-none"
              variants={numberVariants}
              custom={-1}
            >
              4
            </motion.span>
            <motion.div
              variants={ghostVariants}
              whileHover="hover"
              animate={["visible", "floating"]}
            >
              <Image
                src="/images/ghost-404.png"
                alt="Ghost"
                width={120}
                height={120}
                className="w-[80px] h-[80px] md:w-[120px] md:h-[120px] object-contain select-none drop-shadow-lg"
                draggable="false"
                priority
              />
            </motion.div>
            <motion.span 
              className="text-[75px] md:text-[110px] font-bold text-neutral-800 dark:text-neutral-100 opacity-70 select-none leading-none"
              variants={numberVariants}
              custom={1}
            >
              4
            </motion.span>
          </div>
          
          <motion.h2 
            className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-3 md:mb-4 select-none font-sub"
            variants={itemVariants}
          >
            {categoryLabel ? `لا توجد أماكن مسجلة في قسم "${categoryLabel}" حالياً!` : "لم يتم العثور على أي مكان!"}
          </motion.h2>
          
          <motion.p 
            className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 mb-8 select-none font-sub leading-relaxed"
            variants={itemVariants}
          >
            يبدو أن هذا القسم ما زال فارغاً أو في انتظار إضافاتكم ومقترحاتكم الجديدة.
          </motion.p>

          <motion.div 
            className="flex items-center justify-center gap-3 flex-wrap"
            variants={itemVariants}
          >
            {onReset && (
              <motion.button
                type="button"
                onClick={onReset}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary px-6 py-2.5 rounded-full text-base font-medium select-none shadow-lg cursor-pointer"
              >
                عرض كل الأماكن
              </motion.button>
            )}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/propose-place"
                className="btn btn-secondary px-6 py-2.5 rounded-full text-base font-medium select-none inline-flex items-center gap-2"
              >
                <span>أضف مكاناً في هذا القسم</span>
                <span>✨</span>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default PlacesNotFound;

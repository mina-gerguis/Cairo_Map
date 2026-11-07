'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 30
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.43, 0.13, 0.23, 0.96] as [number, number, number, number],
      delayChildren: 0.1,
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96] as [number, number, number, number]
    }
  }
};

const numberVariants: Variants = {
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
      ease: [0.43, 0.13, 0.23, 0.96] as [number, number, number, number]
    }
  }
};

const ghostVariants: Variants = {
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
      ease: [0.43, 0.13, 0.23, 0.96] as [number, number, number, number]
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

interface DirectoryNotFoundProps {
  searchQuery?: string;
  specialty?: string;
  onOpenSuggestModal?: () => void;
  onResetSearch?: () => void;
}

export function DirectoryNotFound({
  searchQuery,
  specialty,
  onOpenSuggestModal,
  onResetSearch,
}: DirectoryNotFoundProps) {
  return (
    <div className="w-full py-12 px-4 flex flex-col items-center justify-center">
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
            {searchQuery 
              ? `لم يتم العثور على أرقام لـ "${searchQuery}"`
              : specialty && specialty !== "الكل"
                ? `لا توجد أرقام مسجلة في تصنيف "${specialty}"`
                : "لم يتم العثور على أرقام مطابقة لبحثك!"}
          </motion.h2>
          
          <motion.p 
            className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 mb-8 select-none font-sub leading-relaxed"
            variants={itemVariants}
          >
            إذا كنت تعرف رقم هذه الجهة أو الخدمة، ساعدنا باقتراحه الآن لنقوم بإضافته للدليل ويستفيد الجميع!
          </motion.p>

          <motion.div 
            className="flex items-center justify-center gap-3 flex-wrap"
            variants={itemVariants}
          >
            {onResetSearch && (
              <motion.button
                type="button"
                onClick={onResetSearch}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-secondary px-6 py-2.5 rounded-full text-base font-medium select-none cursor-pointer w-full"
              >
                عرض كل الأرقام
              </motion.button>
            )}
            {onOpenSuggestModal && (
              <motion.button
                type="button"
                onClick={onOpenSuggestModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary px-6 py-2.5 rounded-full text-base font-medium select-none shadow-lg inline-flex items-center gap-2 cursor-pointer w-full"
              >
                <i className="fa-solid fa-plus" style={{ marginLeft: "4px" }}></i>
                <span>اقترح إضافة هذا الرقم الآن</span>
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default DirectoryNotFound;

'use client';

import { motion } from 'motion/react';
import { Lock, Coins } from 'lucide-react';

interface Material {
  id: string;
  title: string;
  sequenceOrder: number;
}

interface Chapter {
  id: string;
  title: string;
  sequenceOrder: number;
  materials: Material[];
}

interface ProgressionPathProps {
  chapters: Chapter[];
  completedMaterialIds: Set<string>;
  onMaterialClick?: (materialId: string) => void;
}

const chapterVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
      ease: 'easeOut',
    } as any,
  }),
};

const materialVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.2,
      ease: 'easeOut',
    } as any,
  }),
  hover: {
    x: 5,
    transition: { duration: 0.2 } as any,
  },
};

export function ProgressionPath({
  chapters,
  completedMaterialIds,
  onMaterialClick,
}: ProgressionPathProps) {
  const sortedChapters = [...chapters].sort(
    (a, b) => a.sequenceOrder - b.sequenceOrder
  );

  const isMaterialCompleted = (materialId: string): boolean => {
    return completedMaterialIds.has(materialId);
  };

  return (
    <div className="w-full">
      <div className="relative">
        {/* Vertical line background */}
        <motion.div
          className="absolute left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 rounded-full"
          initial={{ height: 0 }}
          animate={{ height: '100%' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        {/* Chapters container */}
        <div className="space-y-8 pl-20">
          {sortedChapters.map((chapter, chapterIndex) => (
            <motion.div
              key={chapter.id}
              className="relative"
              custom={chapterIndex}
              variants={chapterVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Chapter indicator circle */}
              <motion.div
                className="absolute -left-[4.5rem] top-2 w-9 h-9 rounded-full bg-white dark:bg-slate-950 border-4 border-blue-400 dark:border-blue-500 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: chapterIndex * 0.1 + 0.2, duration: 0.3 }}
              >
                {chapterIndex + 1}
              </motion.div>

              {/* Chapter header */}
              <motion.div
                className="mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: chapterIndex * 0.1 + 0.25, duration: 0.3 }}
              >
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {chapter.title}
                </h3>
                <motion.div
                  className="h-1 w-12 bg-gradient-to-r from-blue-400 to-purple-400 dark:from-blue-500 dark:to-purple-500 rounded mt-1"
                  initial={{ width: 0 }}
                  animate={{ width: 48 }}
                  transition={{ delay: chapterIndex * 0.1 + 0.35, duration: 0.3 }}
                />
              </motion.div>

              {/* Materials list */}
              <div className="space-y-2">
                {chapter.materials
                  .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                  .map((material, materialIndex) => {
                    const isCompleted = isMaterialCompleted(material.id);
                    return (
                      <motion.button
                        key={material.id}
                        onClick={() => onMaterialClick?.(material.id)}
                        custom={materialIndex}
                        variants={materialVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        className={`
                          w-full text-left px-4 py-3 rounded-lg
                          border-l-4 transition-all duration-200
                          ${
                            isCompleted
                              ? 'border-l-green-500 dark:border-l-green-400 bg-green-50 dark:bg-slate-900 hover:bg-green-100 dark:hover:bg-slate-800 cursor-pointer'
                              : 'border-l-slate-300 dark:border-l-slate-600 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-not-allowed'
                          }
                        `}
                        disabled={!isCompleted && !onMaterialClick}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`
                              text-sm font-medium
                              ${
                                isCompleted
                                  ? 'text-green-700 dark:text-green-300'
                                  : 'text-slate-700 dark:text-slate-300'
                              }
                            `}
                          >
                            {material.title}
                          </span>
                          <motion.div
                            className="flex items-center gap-2"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: chapterIndex * 0.1 + materialIndex * 0.05 + 0.4 }}
                          >
                            {isCompleted ? (
                              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <Coins className="w-4 h-4" />
                                <span className="text-xs font-semibold">+10</span>
                              </div>
                            ) : (
                              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            )}
                          </motion.div>
                        </div>
                      </motion.button>
                    );
                  })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DailyQuest } from '@/types/progression'
import {
  dailyQuestCardVariants,
  questRewardVariants,
} from '@/lib/animations/variants'

interface DailyQuestCardProps {
  quest: DailyQuest
  onStart?: () => void
  onDismiss?: () => void
  position?: 'floating' | 'fixed'
  className?: string
}

function getHoursUntilExpiration(expiresAt: Date): number {
  const now = new Date()
  const diffMs = expiresAt.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)))
}

function isExpiringWithin(expiresAt: Date, hoursThreshold: number): boolean {
  return getHoursUntilExpiration(expiresAt) <= hoursThreshold
}

export function DailyQuestCard({
  quest,
  onStart,
  onDismiss,
  position = 'floating',
  className = '',
}: DailyQuestCardProps) {
  const [displayProgress, setDisplayProgress] = useState(0)
  const [isDismissed, setIsDismissed] = useState(false)
  const [hoursRemaining, setHoursRemaining] = useState(
    getHoursUntilExpiration(quest.expiresAt)
  )

  const {
    title,
    description,
    current,
    goal,
    xpReward,
    isCompleted,
    expiresAt,
  } = quest

  const percentage = Math.min((current / goal) * 100, 100)
  const isExpiring = isExpiringWithin(expiresAt, 3)
  const isExpired = hoursRemaining === 0 && !isCompleted

  // Animate progress bar on mount and when values change
  useEffect(() => {
    const startTime = Date.now()
    const duration = 600

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOutQuad = 1 - (1 - progress) * (1 - progress)
      setDisplayProgress(percentage * easeOutQuad)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }, [percentage])

  // Update hours remaining periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setHoursRemaining(getHoursUntilExpiration(expiresAt))
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [expiresAt])

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  const handleStart = () => {
    onStart?.()
  }

  const positionClasses = {
    floating: 'fixed bottom-3 sm:bottom-4 md:bottom-6 right-3 sm:right-4 md:right-6 z-40',
    fixed: 'absolute',
  }

  // Determine card background color based on state
  const getCardStyles = () => {
    if (isCompleted) {
      return {
        bg: 'from-green-50 to-transparent dark:from-green-950/20',
        progressColor: 'from-green-400 to-green-500',
        buttonColor: 'bg-green-500 hover:bg-green-600',
      }
    }
    if (isExpired) {
      return {
        bg: 'from-slate-100 to-transparent dark:from-slate-800/20',
        progressColor: 'from-slate-400 to-slate-500',
        buttonColor: 'bg-slate-400 hover:bg-slate-500',
      }
    }
    if (isExpiring) {
      return {
        bg: 'from-orange-50 to-transparent dark:from-orange-950/20',
        progressColor: 'from-orange-400 to-orange-500',
        buttonColor: 'bg-orange-500 hover:bg-orange-600',
      }
    }
    return {
      bg: 'from-teal-50 to-transparent dark:from-teal-950/20',
      progressColor: 'from-teal-400 to-teal-500',
      buttonColor: 'bg-teal-500 hover:bg-teal-600',
    }
  }

  const cardStyles = getCardStyles()

  return (
    <AnimatePresence mode="wait">
      {!isDismissed && !isExpired && (
        <motion.div
          className={cn(
            positionClasses[position],
            'w-[calc(100%-24px)] sm:w-full max-w-xs md:max-w-sm',
            'px-3 sm:px-0',
            className
          )}
          variants={dailyQuestCardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            {/* Background gradient accent - state-based */}
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-40 pointer-events-none',
                'to-transparent',
                cardStyles.bg,
                isCompleted && 'dark:from-green-950/20',
                isExpiring && !isCompleted && 'dark:from-orange-950/20',
              )}
            />

            {/* Close button */}
            <motion.button
              onClick={handleDismiss}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1 rounded-full hover:bg-muted transition-colors duration-200 z-10 min-h-[44px] min-w-[44px] flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Close quest card"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </motion.button>

            <CardHeader className="pb-2 sm:pb-3 pt-2 sm:pt-3 px-3 sm:px-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-sm sm:text-base font-bold tracking-wide line-clamp-2">
                    {isCompleted ? '✓ ' : ''}{title}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-0.5 sm:mt-1 line-clamp-2">
                    {description}
                  </CardDescription>
                </div>
              </div>

              {/* Expiration warning */}
              {isExpiring && !isCompleted && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1 mt-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 px-2 py-1 rounded"
                >
                  <AlertCircle className="h-3 w-3" />
                  <span className="font-medium">Expires in {hoursRemaining}h</span>
                </motion.div>
              )}
            </CardHeader>

            <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-4 pb-3 sm:pb-4">
              {/* Progress section */}
              <div className="space-y-1.5 sm:space-y-2">
                {/* Progress bar */}
                <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className={cn(
                      'h-full bg-gradient-to-r rounded-full',
                      isCompleted && 'from-green-400 to-green-500',
                      isExpired && 'from-slate-400 to-slate-500',
                      isExpiring && !isCompleted && 'from-orange-400 to-orange-500',
                      !isCompleted && !isExpiring && !isExpired && 'from-teal-400 to-teal-500',
                    )}
                    initial={{ width: '0%' }}
                    animate={{ width: `${displayProgress}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                  {/* Shimmer effect on completed quests */}
                  {isCompleted && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                      animate={{ x: ['0%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>

                {/* Progress text */}
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-600 dark:text-slate-400">
                    {current} / {goal}
                  </span>
                  <span
                    className={cn(
                      'font-semibold',
                      isCompleted && 'text-green-600 dark:text-green-400',
                      isExpired && 'text-slate-600 dark:text-slate-400',
                      isExpiring && !isCompleted && 'text-orange-600 dark:text-orange-400',
                      !isCompleted && !isExpiring && 'text-teal-600 dark:text-teal-400',
                    )}
                  >
                    {Math.round(displayProgress)}%
                  </span>
                </div>
              </div>

              {/* XP Reward badge */}
              <motion.div
                className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full text-xs sm:text-xs"
                variants={questRewardVariants}
                initial="hidden"
                animate="visible"
              >
                <span className="font-semibold text-amber-700 dark:text-amber-300">
                  ⭐ +{xpReward} XP
                </span>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="pt-1 sm:pt-2"
              >
                <Button
                  onClick={handleStart}
                  className={cn(
                    'w-full font-semibold text-xs sm:text-sm transition-all duration-200 min-h-[44px] text-white',
                    cardStyles.buttonColor
                  )}
                  disabled={isExpired}
                >
                  {isCompleted ? '✓ COMPLETED' : isExpired ? 'EXPIRED' : 'START'}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

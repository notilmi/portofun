"use client"

import React from "react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { UserRank } from "@/types/progression"

interface EliteRanksCardProps {
  userRank: UserRank
  totalParticipants?: number
  onViewLeague?: () => void
}

const leagueColorMap: Record<string, { bg: string; text: string; buttonBg: string; badgeBg: string; gradientFrom: string; gradientTo: string; icon: string }> = {
  Bronze: {
    bg: "from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-900",
    text: "text-orange-900 dark:text-orange-100",
    buttonBg: "bg-orange-600 hover:bg-orange-700 text-white",
    badgeBg: "bg-gradient-to-br from-orange-400 to-amber-600",
    gradientFrom: "from-orange-400",
    gradientTo: "to-amber-600",
    icon: "🥉",
  },
  Silver: {
    bg: "from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800",
    text: "text-slate-900 dark:text-slate-100",
    buttonBg: "bg-slate-500 hover:bg-slate-600 text-white",
    badgeBg: "bg-gradient-to-br from-slate-300 to-slate-500",
    gradientFrom: "from-slate-300",
    gradientTo: "to-slate-500",
    icon: "🥈",
  },
  Gold: {
    bg: "from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950",
    text: "text-amber-900 dark:text-amber-100",
    buttonBg: "bg-amber-600 hover:bg-amber-700 text-white",
    badgeBg: "bg-gradient-to-br from-amber-400 to-amber-600",
    gradientFrom: "from-amber-400",
    gradientTo: "to-amber-600",
    icon: "🥇",
  },
  Platinum: {
    bg: "from-sky-50 to-cyan-50 dark:from-sky-900 dark:to-cyan-800",
    text: "text-sky-900 dark:text-sky-100",
    buttonBg: "bg-sky-600 hover:bg-sky-700 text-white",
    badgeBg: "bg-gradient-to-br from-sky-300 to-cyan-500",
    gradientFrom: "from-sky-300",
    gradientTo: "to-cyan-500",
    icon: "👑",
  },
  Diamond: {
    bg: "from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900",
    text: "text-blue-900 dark:text-blue-100",
    buttonBg: "bg-blue-600 hover:bg-blue-700 text-white",
    badgeBg: "bg-gradient-to-br from-blue-300 to-purple-600",
    gradientFrom: "from-blue-300",
    gradientTo: "to-purple-600",
    icon: "💎",
  },
}

export const EliteRanksCard: React.FC<EliteRanksCardProps> = ({
  userRank,
  totalParticipants = 10000,
  onViewLeague,
}) => {
  const colorConfig = leagueColorMap[userRank.leagueName] || leagueColorMap.Gold
  const rankPosition = userRank.leaguePosition <= 10 ? `Top ${userRank.leaguePosition}` : `Rank ${userRank.leaguePosition}`
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      whileHover={{ y: -4 }}
      className="w-full"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl shadow-lg",
          "bg-gradient-to-br",
          colorConfig.bg,
          "border border-white/20 dark:border-white/10",
          "p-4 sm:p-6 md:p-8"
        )}
      >
        {/* Animated background elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-white/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Content wrapper */}
        <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6 text-center">
          {/* Rank Badge */}
          <motion.div
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 3,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            className="relative"
          >
            {/* Badge circle with glow */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center">
              {/* Glow effect */}
              <div
                className={cn(
                  "absolute inset-0 rounded-full blur-xl opacity-40",
                  `bg-gradient-to-br ${colorConfig.gradientFrom} ${colorConfig.gradientTo}`
                )}
              />
              
              {/* Badge */}
              <div
                className={cn(
                  "absolute inset-0 rounded-full flex items-center justify-center",
                  "bg-gradient-to-br",
                  colorConfig.badgeBg,
                  "text-3xl sm:text-4xl md:text-5xl",
                  "shadow-lg shadow-black/20"
                )}
              >
                {colorConfig.icon}
              </div>
            </div>

            {/* Rank position label */}
            <div
              className={cn(
                "absolute -bottom-2 left-1/2 -translate-x-1/2",
                "bg-white dark:bg-slate-900 rounded-full",
                "px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold",
                colorConfig.text,
                "shadow-md border border-white/50 dark:border-slate-700 whitespace-nowrap"
              )}
            >
              {rankPosition}
            </div>
          </motion.div>

          {/* Main message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-1 sm:space-y-2"
          >
            <h3 className={cn("text-lg sm:text-xl md:text-2xl font-bold", colorConfig.text)}>
              You&apos;re in the Top {userRank.percentile}% 🎉
            </h3>
            <p className={cn("text-xs sm:text-sm md:text-base font-medium opacity-80", colorConfig.text)}>
              of the {userRank.leagueName} League
            </p>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-3 sm:gap-4 md:gap-8 text-xs sm:text-sm"
          >
            <div className={cn("flex flex-col items-center", colorConfig.text)}>
              <span className="text-xs font-medium opacity-70">Position</span>
              <span className="text-base sm:text-lg md:text-xl font-bold">{userRank.leaguePosition}</span>
            </div>
            <div className="w-px h-6 sm:h-8 bg-white/30 dark:bg-white/10" />
            <div className={cn("flex flex-col items-center", colorConfig.text)}>
              <span className="text-xs font-medium opacity-70">Participants</span>
              <span className="text-base sm:text-lg md:text-xl font-bold">{totalParticipants.toLocaleString()}</span>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="pt-1 sm:pt-2 w-full"
          >
            <Button
              onClick={onViewLeague}
              className={cn(
                "w-full sm:w-auto px-6 sm:px-8",
                colorConfig.buttonBg,
                "font-bold tracking-wide text-xs sm:text-sm",
                "transition-all duration-300",
                "hover:shadow-lg hover:shadow-black/20",
                "active:scale-95",
                "min-h-[44px]"
              )}
              size="lg"
            >
              VIEW LEAGUE
            </Button>
          </motion.div>

          {/* Celebratory emojis - subtle animation */}
          <motion.div
            className="absolute top-3 sm:top-4 right-4 sm:right-6 text-xl sm:text-2xl opacity-20"
            animate={{ rotate: [0, 5, -5, 0], y: [-2, 2, -2, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            ✨
          </motion.div>
          <motion.div
            className="absolute bottom-4 sm:bottom-6 left-3 sm:left-4 text-lg sm:text-xl opacity-15"
            animate={{ rotate: [0, -5, 5, 0], y: [2, -2, 2, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            🏆
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

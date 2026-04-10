"use client"

import { Badge } from "@/components/ui/badge"
import { IconStar } from "@tabler/icons-react"
import { motion } from "motion/react"
import { scaleInVariants, slideInLeftVariants } from "@/lib/animations/variants"

interface LevelDisplayProps {
  currentLevel: number
  currentXP: number
  xpToNextLevel: number
  maxXP?: number
}

export function LevelDisplay({
  currentLevel,
  currentXP,
  xpToNextLevel,
  maxXP = 200
}: LevelDisplayProps) {
  const progressPercentage = (currentXP / maxXP) * 100
  const nextLevel = currentLevel + 1

  return (
    <motion.div
      className="space-y-3"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
          },
        },
      }}
    >
      <motion.div
        className="flex items-center gap-2"
        variants={scaleInVariants}
      >
        <Badge variant="default" className="gap-1">
          <IconStar className="h-3 w-3" />
          Level {currentLevel}
        </Badge>
      </motion.div>

      <motion.div className="space-y-2" variants={slideInLeftVariants}>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">{currentXP} XP</span>
          <span className="text-muted-foreground">{xpToNextLevel} to Level {nextLevel}</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full w-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="text-xs text-muted-foreground">
          {currentXP}/{maxXP} XP to Level {nextLevel}
        </div>
      </motion.div>

      <motion.div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2" variants={slideInLeftVariants}>
        <div className="h-2 w-2 rounded-full bg-green-500" />
        <span className="text-sm font-medium">On track to level up</span>
      </motion.div>
    </motion.div>
  )
}

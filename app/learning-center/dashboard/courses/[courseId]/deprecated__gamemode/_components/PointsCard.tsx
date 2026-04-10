"use client"

import { useEffect, useRef } from "react"
import { motion } from "motion/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react"

interface PointsCardProps {
  totalPoints: number
  pointsThisPeriod: number
  periodLabel?: string
  trendDirection?: "up" | "down" | "neutral"
}

function AnimatedCounter({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const numericValue = parseInt(value.toString().replace(/,/g, ""), 10)
    
    const controls = {
      initial: 0,
      target: numericValue
    }

    const startTime = Date.now()
    const duration = 800
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOutQuad = 1 - (1 - progress) * (1 - progress)
      const current = Math.floor(easeOutQuad * numericValue)

      if (ref.current) {
        ref.current.textContent = current.toLocaleString()
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }, [value])

  return (
    <div ref={ref} className="text-4xl font-bold">
      {value.toLocaleString()}
    </div>
  )
}

export function PointsCard({
  totalPoints,
  pointsThisPeriod,
  periodLabel = "This week",
  trendDirection = "up"
}: PointsCardProps) {
  const getTrendIcon = () => {
    switch (trendDirection) {
      case "up":
        return <IconTrendingUp className="h-5 w-5 text-green-500" />
      case "down":
        return <IconTrendingDown className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getTrendColor = () => {
    switch (trendDirection) {
      case "up":
        return "text-green-500"
      case "down":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Points</CardTitle>
          <CardDescription>Total points earned</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-baseline justify-between gap-2">
              <AnimatedCounter value={totalPoints} />
              <span className="text-sm font-medium text-muted-foreground">pts</span>
            </div>
            
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                +{pointsThisPeriod} {periodLabel}
              </span>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

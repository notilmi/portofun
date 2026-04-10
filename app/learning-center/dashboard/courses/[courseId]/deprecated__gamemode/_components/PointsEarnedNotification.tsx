"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { IconGift, IconX } from "@tabler/icons-react"

interface PointsEarnedNotificationProps {
  points: number
  materialName: string
  duration?: number
  onDismiss?: () => void
}

export function PointsEarnedNotification({
  points,
  materialName,
  duration = 3000,
  onDismiss
}: PointsEarnedNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onDismiss?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onDismiss])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-4 right-4 z-50"
          initial={{ opacity: 0, x: 400, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 400, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <motion.div
            className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-3 shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <IconGift className="h-5 w-5 text-white" />
              </motion.div>
              <div className="flex flex-col gap-0.5">
                <motion.div
                  className="text-sm font-bold text-white"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                >
                  +{points} points!
                </motion.div>
                <motion.div
                  className="text-xs text-white/90"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  {materialName}
                </motion.div>
              </div>
            </div>
            
            <motion.button
              onClick={() => setIsVisible(false)}
              className="ml-2 text-white transition-opacity hover:opacity-75"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <IconX className="h-4 w-4" />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

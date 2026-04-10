/**
 * DailyQuestCard Component - Usage Examples
 * 
 * This file demonstrates how to use the DailyQuestCard component
 * in various scenarios within the gamified progression UI.
 */

import { DailyQuestCard } from './DailyQuestCard'
import { useState } from 'react'

/**
 * Example 1: Basic Usage
 * Minimal props - shows a quest with default positioning (floating)
 */
export function BasicExample() {
  return (
    <DailyQuestCard
      title="DAILY QUEST"
      description="Earn 10 XP in one day to reach your goal"
      current={7}
      goal={10}
      xpReward={50}
    />
  )
}

/**
 * Example 2: With Callbacks
 * Includes handlers for START button and dismiss action
 */
export function WithCallbacksExample() {
  const handleStart = () => {
    console.log('User started the quest')
    // Navigate to lessons or open quest detail
  }

  const handleDismiss = () => {
    console.log('User dismissed the quest card')
    // Hide quest card or update state
  }

  return (
    <DailyQuestCard
      title="DAILY QUEST"
      description="Complete 2 lessons today to earn XP"
      current={1}
      goal={2}
      xpReward={100}
      onStart={handleStart}
      onDismiss={handleDismiss}
    />
  )
}

/**
 * Example 3: Fixed Positioning
 * Card positioned absolutely within a parent container
 */
export function FixedPositionExample() {
  return (
    <div className="relative w-full h-96 bg-slate-100 rounded-lg">
      {/* Your page content here */}
      <DailyQuestCard
        title="DAILY QUEST"
        description="Reach level 5 today"
        current={3}
        goal={5}
        xpReward={75}
        position="fixed"
        className="bottom-4 right-4"
      />
    </div>
  )
}

/**
 * Example 4: Completed Quest
 * Shows quest when current >= goal, displays completed state
 */
export function CompletedQuestExample() {
  const handleStart = () => {
    // Could claim reward or submit quest completion
    console.log('Claiming quest reward!')
  }

  return (
    <DailyQuestCard
      title="DAILY QUEST"
      description="Earn 50 XP today"
      current={50}
      goal={50}
      xpReward={200}
      onStart={handleStart}
    />
  )
}

/**
 * Example 5: Interactive State Management
 * Full example with state management for showing/hiding
 */
export function InteractiveExample() {
  const [showQuest, setShowQuest] = useState(true)
  const [progress, setProgress] = useState(0)

  const handleStart = () => {
    alert('Quest started! Navigate to lessons.')
  }

  const handleDismiss = () => {
    setShowQuest(false)
  }

  const handleAddProgress = () => {
    setProgress(prev => Math.min(prev + 1, 10))
  }

  if (!showQuest) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setShowQuest(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Show Quest
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DailyQuestCard
        title="DAILY QUEST"
        description="Complete lessons and earn XP"
        current={progress}
        goal={10}
        xpReward={100}
        onStart={handleStart}
        onDismiss={handleDismiss}
      />

      <button
        onClick={handleAddProgress}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Add Progress ({progress}/10)
      </button>
    </div>
  )
}

/**
 * Component Features:
 * 
 * ✓ "use client" directive for client-side rendering
 * ✓ Animated slide-in and slide-out transitions
 * ✓ Smooth progress bar animation with ease-out easing
 * ✓ Shimmer effect on completed quests
 * ✓ Progress percentage display
 * ✓ XP reward badge with star icon
 * ✓ START button that changes to COMPLETED when goal is reached
 * ✓ Close (X) button for dismissing the card
 * ✓ Floating position (fixed) or fixed position (absolute) options
 * ✓ Dark mode support with Tailwind CSS
 * ✓ Hover effects on buttons and card
 * ✓ Motion/Framer animations for smooth UX
 * ✓ TypeScript support with full prop interface
 * ✓ Accessible with ARIA labels
 * 
 * Props:
 * - title: string - Card title (e.g., "DAILY QUEST")
 * - description: string - Quest description
 * - current: number - Current progress value
 * - goal: number - Goal/target value
 * - xpReward: number - XP points for completion
 * - onStart?: () => void - Callback for START button click
 * - onDismiss?: () => void - Callback for close button click
 * - position?: 'floating' | 'fixed' - Card positioning mode (default: 'floating')
 * - className?: string - Additional Tailwind classes for customization
 * 
 * Styling:
 * - Uses shadcn/ui Card, Button, and related components
 * - Tailwind CSS for styling and dark mode
 * - Motion/react (Framer Motion) for animations
 * - Lucide React icons (X icon for close button)
 * - Color scheme: Teal for progress/primary, Amber for XP rewards, Green for completed
 * 
 * Animation Details:
 * - Card: Slide in from bottom (y: 20) with opacity fade (0.3s)
 * - Progress bar: Animates from 0% to current% over 0.6s
 * - XP badge: Fades and scales in with 0.2s delay
 * - Button: Fades in with 0.3s delay
 * - Close button: Hover scale effect (1.1x)
 * - Shimmer: Infinite animation on completed quests
 */

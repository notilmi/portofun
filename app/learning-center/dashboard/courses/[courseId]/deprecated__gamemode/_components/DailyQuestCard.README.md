# DailyQuestCard Component

## Overview
The `DailyQuestCard` is a client-side React component that displays daily quest progress as an animated, floating or fixed card. It's part of the gamified progression UI for the learning dashboard.

## File Location
```
app/learning-center/dashboard/courses/[courseId]/gamemode/_components/DailyQuestCard.tsx
```

## Features

### Core Functionality
- ✅ **"use client" directive** - Client-side rendering for optimal interactivity
- ✅ **Animated transitions** - Slide-in/out animations using Framer Motion
- ✅ **Progress bar** - Smooth animated progress bar with percentage display
- ✅ **Completion detection** - Automatically shows "COMPLETED" state when current >= goal
- ✅ **Shimmer effect** - Animated shimmer on completed quests
- ✅ **XP reward badge** - Displays reward points with star icon
- ✅ **Dismissible** - Close button for removing the card
- ✅ **Dark mode support** - Full Tailwind CSS dark mode compatibility
- ✅ **Flexible positioning** - Floating (fixed) or positioned (absolute) layouts

### UI Components
- **Title** - Quest name (e.g., "DAILY QUEST")
- **Description** - Quest details and objectives
- **Progress Bar** - Visual representation with current/goal ratio
- **Progress Text** - Numeric display (e.g., "7 / 10") and percentage
- **XP Badge** - Reward amount with star icon
- **START Button** - Call-to-action button (green when completed)
- **Close Button** - X button for dismissal

### Animation Details
- **Card entry**: Slides up from bottom with opacity fade (300ms)
- **Progress bar**: Eases out from 0% to target (600ms)
- **XP badge**: Fades and scales in with 200ms delay
- **Button**: Fades in with 300ms delay
- **Close button**: Hover scale effect (1.1x)
- **Shimmer**: Infinite animation for completed quests
- **Card exit**: Slides down with opacity fade when dismissed (300ms)

## Props Interface

```typescript
interface DailyQuestCardProps {
  title: string                    // Quest title (e.g., "DAILY QUEST")
  description: string              // Quest description text
  current: number                  // Current progress value
  goal: number                     // Goal/target value
  xpReward: number                 // XP reward for completion
  onStart?: () => void             // Callback when START button clicked
  onDismiss?: () => void           // Callback when card dismissed
  position?: 'floating' | 'fixed'  // Positioning mode (default: 'floating')
  className?: string               // Additional Tailwind CSS classes
}
```

## Usage Examples

### Basic Usage
```tsx
<DailyQuestCard
  title="DAILY QUEST"
  description="Earn 10 XP in one day to reach your goal"
  current={7}
  goal={10}
  xpReward={50}
/>
```

### With Callbacks
```tsx
<DailyQuestCard
  title="DAILY QUEST"
  description="Complete 2 lessons today"
  current={1}
  goal={2}
  xpReward={100}
  onStart={() => navigate('/lessons')}
  onDismiss={() => setShowQuest(false)}
/>
```

### Fixed Positioning
```tsx
<div className="relative">
  {/* Page content */}
  <DailyQuestCard
    title="DAILY QUEST"
    description="Reach level 5"
    current={3}
    goal={5}
    xpReward={75}
    position="fixed"
    className="bottom-4 right-4"
  />
</div>
```

### Completed Quest
```tsx
<DailyQuestCard
  title="DAILY QUEST"
  description="Earn 50 XP today"
  current={50}
  goal={50}
  xpReward={200}
  onStart={() => claimReward()}
/>
```

## Styling

### Color Scheme
- **Progress bar**: Teal gradient (from-teal-400 to-teal-500)
- **Progress background**: Slate (slate-200 / dark:slate-700)
- **XP badge**: Amber (amber-100 / dark:amber-900/30)
- **Button primary**: Teal (bg-teal-500 hover:bg-teal-600)
- **Button completed**: Green (bg-green-500 hover:bg-green-600)
- **Text**: Standard dark/light mode text colors

### Styling Classes
- Card: `shadow-lg hover:shadow-xl` with rounded corners
- Background accent: `bg-gradient-to-br from-teal-50 to-transparent` (light mode)
- Dark mode: Full support with `-dark:` variants

## Dependencies

### Imports
```typescript
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'  // Framer Motion
import { Button } from '@/components/ui/button'         // shadcn/ui
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X } from 'lucide-react'                        // Icons
import { cn } from '@/lib/utils'                        // Class merge utility
```

## State Management

### Internal State
- `displayProgress` - Animated progress percentage (0-100)
- `isDismissed` - Whether the card has been dismissed

### State Calculation
- `percentage` - Calculated from `current / goal * 100`
- `isCompleted` - True when `current >= goal`

## Animation Implementation

### Progress Bar Animation
Uses `requestAnimationFrame` for smooth animation:
- Duration: 600ms
- Easing: easeOutQuad (ease-out)
- Updates `displayProgress` state during animation

### Framer Motion
- **motion.div** - Container with slide-in/out animations
- **motion.button** - Close button with hover effects
- **motion.div** - Progress bar with width animation
- **AnimatePresence** - Handles exit animations

## Accessibility

### Features
- `aria-label="Close quest card"` on close button
- Semantic HTML button elements
- Keyboard accessible (buttons can be focused and activated)
- High contrast with dark mode support
- Clear text labels for all interactive elements

## Browser Compatibility

- Modern browsers with ES6+ support
- Requires React 18+ (hooks support)
- Framer Motion animation support
- Tailwind CSS support

## Performance Considerations

- Uses `requestAnimationFrame` for smooth 60fps animations
- AnimatePresence enables proper exit animations
- Motion library optimizes GPU acceleration
- No unnecessary re-renders through proper dependency arrays

## Known Limitations

- Progress bar is linear (no spring physics)
- Positioning relative to viewport when floating
- Z-index set to 40 (adjustable via Tailwind)

## Integration Notes

### Exported From
```typescript
// In _components/index.ts
export { DailyQuestCard } from './DailyQuestCard'
```

### Import Usage
```typescript
import { DailyQuestCard } from '@/app/learning-center/dashboard/courses/[courseId]/gamemode/_components'
```

## Responsive Design

- Works on all screen sizes
- `max-w-sm` constraint for card width
- Adapts to parent container
- Floating mode: Fixed to bottom-right of viewport
- Fixed mode: Positioned within parent element

## Future Enhancements

Possible improvements:
- Spring physics animations
- Multiple quest types
- Quest categories/filtering
- Streak display
- Bonus multipliers
- Sound effects
- Haptic feedback

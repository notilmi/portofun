# LessonNode Component - Quick Reference

## Location
`app/learning-center/dashboard/courses/[courseId]/gamemode/_components/LessonNode.tsx`

## Props Interface
```typescript
interface LessonNodeProps {
  id: string;                          // Unique lesson ID
  title: string;                       // Lesson title (e.g., "Basics")
  icon: string | React.ReactNode;     // Icon/emoji or icon component
  status: 'completed' | 'current' | 'locked'; // Lesson status
  onClick?: () => void;                // Callback when node clicked
  completionPercent?: number;          // Optional completion percentage (0-100)
}
```

## Usage Example
```tsx
import { LessonNode } from '@/app/learning-center/dashboard/courses/[courseId]/gamemode/_components';

// Using emoji icon
<LessonNode
  id="lesson-1"
  title="Basics"
  icon="🎓"
  status="completed"
  onClick={() => navigate('/lesson/1')}
/>

// Using React component icon
import { IconBook } from '@tabler/icons-react';

<LessonNode
  id="lesson-2"
  title="Advanced Topics"
  icon={<IconBook className="w-6 h-6" />}
  status="current"
  completionPercent={65}
  onClick={() => navigate('/lesson/2')}
/>

// Locked lesson
<LessonNode
  id="lesson-3"
  title="Mastery"
  icon="🏆"
  status="locked"
/>
```

## Visual States

### Completed State
- **Color**: Amber/Gold (#fcd34d)
- **Indicator**: Green checkmark badge (bottom-right)
- **Status Label**: "Completed"
- **Interaction**: Clickable but no animation

### Current State
- **Color**: Emerald/Green (#10b981)
- **Indicator**: Subtle pulse animation
- **Animation**: Rotating progress ring
- **Status Label**: "Current"
- **Interaction**: Clickable with scale animation on hover
- **Optional**: Completion ring progress visualization

### Locked State
- **Color**: Gray (#d1d5db)
- **Indicator**: Lock icon badge (bottom-right)
- **Status Label**: "Locked"
- **Interaction**: Not clickable, disabled cursor

## Features

✅ **Framer Motion Animations**
- Pulse animation for current state
- Scale animations on hover/click
- Spring physics for smooth interactions
- Progress ring rotation

✅ **Accessibility**
- Semantic button role when clickable
- ARIA labels for screen readers
- Keyboard navigation (Enter/Space)
- Proper focus management
- Disabled state for locked items

✅ **Dark Mode Support**
- All colors adapt to dark mode
- Proper contrast ratios maintained

✅ **Responsive Design**
- Mobile-friendly sizes (70px → 96px based on screen)
- Touch-friendly minimum 44px hit area
- Responsive text sizing

✅ **Visual Design**
- Circular layout with icon centered
- Drop shadows for depth
- Grayscale overlay for locked state
- Smooth transitions between states

## Animation Details

| State/Interaction | Animation | Duration |
|---|---|---|
| Current pulse | Scale 1 → 1.08 → 1 | 2s (infinite) |
| Hover (clickable) | Scale 1 → 1.05 | 300ms |
| Click (tap) | Scale 1 → 0.95 | 100ms |
| Progress ring | Rotate 360° | 3s (infinite) |
| Status indicator | Scale 0 → 1 (spring) | 0.3s |
| Title appear | Fade + slide up | 0.3s |

## Export
The component is exported from the barrel file:
```typescript
export { LessonNode } from './LessonNode';
```

Available from the index.ts file for convenient imports.

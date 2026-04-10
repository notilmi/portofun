# LessonNode Component - Usage Examples

## Basic Usage with Emoji Icon

```tsx
import { LessonNode } from '@/app/learning-center/dashboard/courses/[courseId]/gamemode/_components';

export function ExampleOne() {
  return (
    <LessonNode
      id="lesson-1"
      title="Basics"
      icon="🎓"
      status="completed"
      onClick={() => console.log('Lesson clicked')}
    />
  );
}
```

## With React Component Icon

```tsx
import { LessonNode } from '@/app/learning-center/dashboard/courses/[courseId]/gamemode/_components';
import { IconBook } from '@tabler/icons-react';

export function ExampleTwo() {
  return (
    <LessonNode
      id="lesson-2"
      title="Advanced Topics"
      icon={<IconBook className="w-6 h-6" />}
      status="current"
      completionPercent={65}
      onClick={() => navigate('/lesson/2')}
      index={1}
    />
  );
}
```

## All Three States

```tsx
import { LessonNode } from '@/app/learning-center/dashboard/courses/[courseId]/gamemode/_components';

export function AllStates() {
  return (
    <div className="flex gap-8 p-8">
      {/* Completed State */}
      <LessonNode
        id="lesson-1"
        title="Basics"
        icon="🎓"
        status="completed"
        onClick={() => console.log('Navigate to lesson 1')}
      />

      {/* Current State */}
      <LessonNode
        id="lesson-2"
        title="Intermediate"
        icon="📚"
        status="current"
        completionPercent={50}
        onClick={() => console.log('Navigate to lesson 2')}
        index={1}
      />

      {/* Locked State */}
      <LessonNode
        id="lesson-3"
        title="Advanced"
        icon="🏆"
        status="locked"
        index={2}
      />
    </div>
  );
}
```

## In a Container with Stagger Animation

```tsx
import { LessonNode } from '@/app/learning-center/dashboard/courses/[courseId]/gamemode/_components';
import { motion } from 'motion/react';
import { lessonNodeContainerVariants, lessonNodeVariants } from '@/lib/animations/variants';

export function LessonNodeList() {
  const lessons = [
    { id: '1', title: 'Basics', icon: '🎓', status: 'completed' },
    { id: '2', title: 'Intermediate', icon: '📚', status: 'current', progress: 50 },
    { id: '3', title: 'Advanced', icon: '🏆', status: 'locked' },
  ];

  return (
    <motion.div
      className="flex flex-wrap gap-6 p-8"
      variants={lessonNodeContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {lessons.map((lesson, idx) => (
        <LessonNode
          key={lesson.id}
          id={lesson.id}
          title={lesson.title}
          icon={lesson.icon}
          status={lesson.status as any}
          completionPercent={lesson.progress}
          onClick={() => console.log(`Navigate to ${lesson.id}`)}
          index={idx}
        />
      ))}
    </motion.div>
  );
}
```

## Props Reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | ✓ | Unique lesson identifier |
| `title` | string | ✓ | Lesson display name |
| `icon` | string \| ReactNode | ✓ | Emoji string or React component |
| `status` | 'completed' \| 'current' \| 'locked' | ✓ | Lesson status |
| `onClick` | () => void | ✗ | Click handler (not called when locked) |
| `completionPercent` | number | ✗ | Progress percentage (0-100, only shown in current state) |
| `index` | number | ✗ | Index for stagger animation delay (default: 0) |

## Visual States Behavior

### Completed State
- **Color**: Amber/Gold
- **Icon Badge**: Green checkmark
- **Animation**: None (static)
- **Clickable**: Yes (if onClick provided)
- **Progress Ring**: Not shown

### Current State
- **Color**: Emerald/Green
- **Indicator**: Rotating progress ring
- **Animation**: Subtle pulse (scale 1→1.08→1, 0.5s cycle)
- **Clickable**: Yes
- **Progress Ring**: Shows completionPercent if > 0

### Locked State
- **Color**: Gray
- **Icon Badge**: Lock icon
- **Animation**: None
- **Clickable**: No (disabled)
- **Progress Ring**: Not shown

## Accessibility Features

- ✅ Semantic button role when clickable
- ✅ ARIA labels for status and title
- ✅ Keyboard navigation (Enter/Space to activate)
- ✅ Disabled state for locked items
- ✅ 44px minimum touch target
- ✅ Respects prefers-reduced-motion (via animation variants)

## Responsive Sizes

| Breakpoint | Size | Classes |
|-----------|------|---------|
| Mobile | 70px | `w-[70px] h-[70px]` |
| Tablet (sm) | 80px | `sm:w-20 sm:h-20` |
| Desktop (md+) | 96px | `md:w-24 md:h-24` |

## Dark Mode Support

All colors automatically adapt to dark mode:
- Backgrounds have `dark:` variants
- Text has proper contrast
- Status labels have `dark:` color classes

## Example: Navigation Integration

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { LessonNode } from '@/app/learning-center/dashboard/courses/[courseId]/gamemode/_components';

export function LessonNodeWithNavigation() {
  const router = useRouter();

  return (
    <LessonNode
      id="lesson-1"
      title="Basics"
      icon="🎓"
      status="completed"
      onClick={() => {
        router.push(`/learning-center/dashboard/courses/course-1/material/lesson-1`);
      }}
    />
  );
}
```

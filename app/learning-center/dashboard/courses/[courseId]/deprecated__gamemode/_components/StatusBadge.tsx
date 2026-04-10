'use client';

import React from 'react';
import { IconCheck, IconClock, IconLock } from '@tabler/icons-react';

type StatusType = 'completed' | 'in_progress' | 'locked';

interface StatusBadgeProps {
  status: StatusType;
  icon?: string;
}

const statusConfig = {
  completed: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    borderColor: 'border-green-300 dark:border-green-700',
    Icon: IconCheck,
    label: 'Completed',
  },
  in_progress: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    borderColor: 'border-amber-300 dark:border-amber-700',
    Icon: IconClock,
    label: 'In Progress',
  },
  locked: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    borderColor: 'border-gray-300 dark:border-gray-600',
    Icon: IconLock,
    label: 'Locked',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];
  const Icon = config.Icon;

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full border ${config.bg} ${config.borderColor} p-1.5`}
      role="status"
      aria-label={config.label}
    >
      <Icon size={14} className={config.text} />
    </div>
  );
};

export default StatusBadge;

'use client';

import React from 'react';

interface Stat {
  id: string;
  icon?: React.ReactNode;
  label: string;
  value: number | string;
  trendValue?: number;
  trendDirection?: 'up' | 'down';
  unit?: string;
  sparkline?: boolean;
  backgroundColor?: string;
  valueColor?: string;
}

interface StatsGridProps {
  stats: Stat[];
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  className = '',
  gap = 'md',
}) => {
  const { StatCard } = require('./StatCard');

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div
      className={`
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-4
        ${gapClasses[gap]}
        ${className}
      `}
    >
      {stats.map((stat) => (
        <StatCard
          key={stat.id}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          trendValue={stat.trendValue}
          trendDirection={stat.trendDirection}
          unit={stat.unit}
          sparkline={stat.sparkline}
          backgroundColor={stat.backgroundColor}
          valueColor={stat.valueColor}
        />
      ))}
    </div>
  );
};

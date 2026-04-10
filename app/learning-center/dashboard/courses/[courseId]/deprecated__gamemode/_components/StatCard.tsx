'use client';

import React from 'react';
import { motion } from 'motion/react';

interface StatCardProps {
  icon?: React.ReactNode;
  label: string;
  value: number | string;
  trendValue?: number;
  trendDirection?: 'up' | 'down';
  unit?: string;
  sparkline?: boolean;
  backgroundColor?: string;
  valueColor?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  trendValue,
  trendDirection,
  unit,
  sparkline = false,
  backgroundColor = 'bg-slate-50 dark:bg-slate-900',
  valueColor = 'text-blue-600 dark:text-blue-400',
  className = '',
}) => {
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
  const showTrend = trendValue !== undefined && trendDirection;
  const trendColor =
    trendDirection === 'up'
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';
  const trendBg =
    trendDirection === 'up'
      ? 'bg-green-50 dark:bg-green-950'
      : 'bg-red-50 dark:bg-red-950';

  return (
    <motion.div
      className={`
        ${backgroundColor} 
        rounded-lg 
        p-6 
        shadow-sm 
        hover:shadow-md 
        transition-all 
        duration-300 
        border 
        border-slate-200 
        dark:border-slate-800
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
    >
      {/* Header with icon and trend */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="text-2xl flex-shrink-0">
              {icon}
            </div>
          )}
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {label}
          </p>
        </div>
        
        {showTrend && (
          <div className={`${trendBg} rounded-full px-2 py-1 flex items-center gap-1`}>
            <span className={`text-xs font-semibold ${trendColor}`}>
              {trendDirection === 'up' ? '↑' : '↓'} {trendValue}%
            </span>
          </div>
        )}
      </div>

      {/* Main value */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-bold ${valueColor}`}>
            {formattedValue}
          </span>
          {unit && (
            <span className="text-sm text-slate-500 dark:text-slate-500">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Sparkline placeholder */}
      {sparkline && (
        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-xs text-slate-400">
          <svg
            className="w-full h-full p-2"
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
          >
            <polyline
              points="5,30 15,20 25,25 35,15 45,22 55,12 65,18 75,8 85,14 95,5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-blue-400"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}
    </motion.div>
  );
};

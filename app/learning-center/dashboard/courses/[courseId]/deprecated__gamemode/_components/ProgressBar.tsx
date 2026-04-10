'use client';

import React, { useEffect, useState } from 'react';

interface Milestone {
  percentage: number;
  label: string;
}

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  barColor?: string;
  backgroundColor?: string;
  milestones?: Milestone[];
  animated?: boolean;
  height?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  label,
  showPercentage = true,
  barColor = 'bg-gradient-to-r from-blue-500 to-blue-600',
  backgroundColor = 'bg-slate-200 dark:bg-slate-700',
  milestones,
  animated = true,
  height = 'md',
  className = '',
}) => {
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const percentage = Math.min((current / total) * 100, 100);

  useEffect(() => {
    if (!animated) {
      setDisplayPercentage(percentage);
      return;
    }

    let animationFrame: NodeJS.Timeout;
    const startTime = Date.now();
    const duration = 600;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayPercentage(percentage * progress);

      if (progress < 1) {
        animationFrame = setTimeout(animate, 16);
      }
    };

    animate();

    return () => clearTimeout(animationFrame);
  }, [percentage, animated]);

  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={className}>
      {/* Header with label and percentage */}
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {label}
            </p>
          )}
          {showPercentage && (
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              {Math.round(displayPercentage)}%
            </span>
          )}
        </div>
      )}

      {/* Progress bar container */}
      <div className={`relative ${backgroundColor} rounded-full overflow-hidden`}>
        <div
          className={`
            ${heightClasses[height]}
            ${barColor}
            rounded-full
            transition-all
            duration-300
            ease-out
            ${animated ? '' : ''}
          `}
          style={{
            width: `${displayPercentage}%`,
          }}
        />

        {/* Milestones */}
        {milestones && milestones.length > 0 && (
          <div className="absolute inset-0 flex items-center">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white dark:bg-slate-900 opacity-50"
                style={{
                  left: `${milestone.percentage}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Milestone labels */}
      {milestones && milestones.length > 0 && (
        <div className="relative mt-1 h-6">
          {milestones.map((milestone, index) => (
            <span
              key={index}
              className="absolute text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap"
              style={{
                left: `${milestone.percentage}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {milestone.label}
            </span>
          ))}
        </div>
      )}

      {/* Current/Total text */}
      {total > 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          {current} / {total}
        </p>
      )}
    </div>
  );
};

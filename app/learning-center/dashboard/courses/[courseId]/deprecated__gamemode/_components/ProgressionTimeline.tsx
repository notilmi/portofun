'use client';

import React from 'react';

interface ProgressionTimelineProps {
  length: number;
  color?: string;
  animated?: boolean;
}

export const ProgressionTimeline: React.FC<ProgressionTimelineProps> = ({
  length,
  color = 'gray-300',
  animated = false,
}) => {
  if (length <= 0) return null;

  const baseHeight = length;

  return (
    <div
      className="relative w-1 flex-shrink-0"
      style={{ height: `${baseHeight}px` }}
      role="presentation"
    >
      {/* Background line */}
      <div
        className={`absolute left-0 top-0 w-full border-l-2 border-dashed border-${color}`}
        style={{ height: `${baseHeight}px` }}
      />

      {/* Animated flowing line */}
      {animated && (
        <div
          className={`absolute left-0 top-0 w-full border-l-2 border-${color} opacity-60`}
          style={{
            height: `${baseHeight}px`,
            animation: 'flow 2s ease-in-out infinite',
            boxShadow: 'inset 0 0 8px rgba(59, 130, 246, 0.3)',
          }}
        />
      )}

      <style>{`
        @keyframes flow {
          0% {
            box-shadow: inset 0 -${baseHeight}px 8px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: inset 0 0px 8px rgba(59, 130, 246, 0.5);
          }
          100% {
            box-shadow: inset 0 ${baseHeight}px 8px rgba(59, 130, 246, 0.3);
          }
        }
      `}</style>
    </div>
  );
};

export default ProgressionTimeline;

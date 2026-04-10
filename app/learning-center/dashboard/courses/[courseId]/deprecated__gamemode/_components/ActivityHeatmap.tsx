'use client';

import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface DayData {
  day: string;
  date: Date;
  completed: boolean;
  count?: number;
  isCurrentWeek?: boolean;
}

interface ActivityHeatmapProps {
  weekData: DayData[];
  title?: string;
  description?: string;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function ActivityHeatmap({
  weekData,
  title = 'Weekly Activity',
  description = 'Your learning activity this week',
}: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const getActivityColor = (completed: boolean, count?: number): string => {
    if (!completed) {
      return 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700';
    }

    const intensity = Math.min((count || 1) / 3, 1);
    if (intensity < 0.33) {
      return 'bg-green-200 dark:bg-green-900 hover:bg-green-300 dark:hover:bg-green-800';
    } else if (intensity < 0.66) {
      return 'bg-green-400 dark:bg-green-700 hover:bg-green-500 dark:hover:bg-green-600';
    } else {
      return 'bg-green-600 dark:bg-green-600 hover:bg-green-700 dark:hover:bg-green-500';
    }
  };

  const getActivityIcon = (completed: boolean, count?: number): string => {
    if (!completed) return '○';
    if (!count || count === 1) return '◐';
    if (count === 2) return '◑';
    return '●';
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const totalActive = weekData.filter((d) => d.completed).length;
  const currentWeekActive = weekData.filter((d) => d.isCurrentWeek && d.completed).length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-7 gap-2">
          {DAY_LABELS.map((label) => (
            <div key={label} className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2">
              {label}
            </div>
          ))}

          {weekData.map((dayData, idx) => (
            <TooltipProvider key={idx}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`
                      w-full aspect-square rounded-lg border-2 border-transparent
                      flex items-center justify-center font-semibold text-sm
                      transition-all duration-200
                      ${getActivityColor(dayData.completed, dayData.count)}
                      ${dayData.isCurrentWeek ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                      ${hoveredDay === dayData.day ? 'scale-110 shadow-lg' : ''}
                    `}
                    onMouseEnter={() => setHoveredDay(dayData.day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <span className={`${dayData.completed ? 'text-white dark:text-white' : 'text-gray-400'}`}>
                      {getActivityIcon(dayData.completed, dayData.count)}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs space-y-1">
                    <p className="font-semibold">{dayData.day}</p>
                    <p>{formatDate(dayData.date)}</p>
                    {dayData.completed ? (
                      <>
                        <p className="text-green-400">✓ Active</p>
                        {dayData.count && <p>Materials completed: {dayData.count}</p>}
                      </>
                    ) : (
                      <p className="text-gray-400">No activity</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        <div className="border-t pt-4 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{currentWeekActive}/7</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Days active</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">Overall</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalActive}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Days active</p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-2">Activity Intensity</p>
          <div className="flex gap-1">
            {[
              { color: 'bg-gray-100 dark:bg-gray-800', label: 'No activity' },
              { color: 'bg-green-200 dark:bg-green-900', label: 'Low' },
              { color: 'bg-green-400 dark:bg-green-700', label: 'Medium' },
              { color: 'bg-green-600 dark:bg-green-600', label: 'High' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded ${item.color}`} />
                <span className="text-xs text-gray-600 dark:text-gray-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { ReactNode } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: ReactNode;
  color: string;
  iconColor: string;
}

export default function MetricCard({
  title,
  value,
  change,
  trend,
  icon,
  color,
  iconColor,
}: MetricCardProps) {
  return (
    <div className={`rounded-lg p-4 ${color}`}>
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-full ${iconColor} bg-white bg-opacity-40`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center mt-4">
        {trend === 'up' ? (
          <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
        ) : trend === 'down' ? (
          <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
        ) : null}
        <span className={trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
          {change} {trend === 'up' ? 'increase' : trend === 'down' ? 'decrease' : ''}
        </span>
      </div>
    </div>
  );
} 
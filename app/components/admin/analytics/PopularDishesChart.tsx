'use client';

import { useAnalytics } from '@/[lng]/context/AnalyticsContext';

export default function PopularDishesChart() {
  const { popularDishes, isLoading, error } = useAnalytics();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return <div className="h-full flex justify-center items-center">Loading dish data...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!popularDishes || popularDishes.length === 0) {
    return <div className="text-gray-500">No dish data available</div>;
  }

  // Trim the data to top 5 dishes at most
  const topDishes = popularDishes.slice(0, 5);
  const maxCount = Math.max(...topDishes.map(dish => dish.count));

  return (
    <div className="space-y-3">
      {topDishes.map((dish) => (
        <div key={dish.id} className="mb-3">
          <div className="flex justify-between items-center text-sm mb-1">
            <div className="font-medium">{dish.name}</div>
            <div className="text-gray-500">{dish.count} orders</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-600 h-2.5 rounded-full"
              style={{ width: `${(dish.count / maxCount) * 100}%` }}
            ></div>
          </div>
          <div className="text-xs text-right mt-1 text-gray-500">
            {formatCurrency(dish.revenue)}
          </div>
        </div>
      ))}
    </div>
  );
} 
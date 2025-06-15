'use client';

import { useAnalytics } from '@/[lng]/(default)/context/AnalyticsContext';
import { useParams } from 'next/navigation';
import { PopularDish } from '@/[lng]/(default)/services/analyticsService';
import { fallbackLng } from '@/i18n/settings';

export default function PopularDishesChart() {
  const { popularDishes, isLoading, error } = useAnalytics();
  const params = useParams();
  const lng = params?.lng as string || 'vi'; // Default to Vietnamese if language not found

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Helper function to safely get the dish name in the correct language
  const getDishName = (dish: PopularDish): string => {
    if (!dish.name) return 'Unknown Dish';
    
    // If name is a string, return it directly
    if (typeof dish.name === 'string') return dish.name;
    
    // If name is an object with language keys, return the appropriate one
    if (typeof dish.name === 'object') {
      // Try to get the current language version
      const localizedName = dish.name[lng];
      if (localizedName) return localizedName;
      
      // Fallback to any available language
      if (dish.name[lng as keyof typeof dish.name]) return dish.name[lng as keyof typeof dish.name];
      if (dish.name[fallbackLng as keyof typeof dish.name]) return dish.name[fallbackLng as keyof typeof dish.name];
      
      // If no language versions found, return a default
      return 'Unnamed Dish';
    }
    
    // Fallback for any other case
    return String(dish.name);
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
      {topDishes.map((dish, index) => (
        <div key={`dish-${index}`} className="mb-3">
          <div className="flex justify-between items-center text-sm mb-1">
            <div className="font-medium">{getDishName(dish)}</div>
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
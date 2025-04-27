'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type DishData = {
  id: string;
  name: string;
  orderCount: number;
  revenue: number;
  category: string;
};

export default function PopularDishesChart() {
  const searchParams = useSearchParams();
  const [dishes, setDishes] = useState<DishData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'orders' | 'revenue'>('orders');
  
  const timeRange = searchParams.get('range') || 'month';
  const region = searchParams.get('region') || 'all';
  const category = searchParams.get('category') || 'all';
  const startDate = searchParams.get('start');
  const endDate = searchParams.get('end');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real implementation, you would fetch data from your API with the filter parameters
        // For now, we'll simulate an API call with mock data
        console.log('Fetching popular dishes with filters:', { timeRange, region, category, startDate, endDate });
        
        // Simulate API request delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        const mockDishes: DishData[] = [
          { id: '1', name: 'Vegan Pho', orderCount: 142, revenue: 13916000, category: 'main' },
          { id: '2', name: 'Tofu Rice Bowl', orderCount: 128, revenue: 10880000, category: 'main' },
          { id: '3', name: 'Mushroom Spring Rolls', orderCount: 112, revenue: 7280000, category: 'side' },
          { id: '4', name: 'Coconut Smoothie', orderCount: 96, revenue: 4320000, category: 'beverage' },
          { id: '5', name: 'Mango Sticky Rice', orderCount: 89, revenue: 4895000, category: 'dessert' },
          { id: '6', name: 'Lemongrass Tofu', orderCount: 78, revenue: 6318000, category: 'main' },
          { id: '7', name: 'Green Papaya Salad', orderCount: 71, revenue: 4615000, category: 'side' },
        ];
        
        // Filter by category if specified
        const filteredDishes = category !== 'all' 
          ? mockDishes.filter(dish => dish.category === category)
          : mockDishes;
          
        setDishes(filteredDishes);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching popular dishes:', err);
        setError('Failed to load dishes data');
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, region, category, startDate, endDate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Get top 5 dishes based on sort criteria
  const topDishes = [...dishes]
    .sort((a, b) => (sortBy === 'orders' 
      ? b.orderCount - a.orderCount 
      : b.revenue - a.revenue))
    .slice(0, 5);
    
  // Calculate the maximum value for proper scaling
  const maxValue = Math.max(
    ...topDishes.map(dish => sortBy === 'orders' ? dish.orderCount : dish.revenue)
  );

  if (loading) {
    return <div className="h-full flex justify-center items-center">Loading chart data...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (dishes.length === 0) {
    return <div className="text-gray-500">No data available</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Top {topDishes.length} dishes by
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('orders')}
            className={`px-3 py-1 text-xs rounded-full ${
              sortBy === 'orders' 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setSortBy('revenue')}
            className={`px-3 py-1 text-xs rounded-full ${
              sortBy === 'revenue' 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Revenue
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-end">
        {topDishes.map((dish, index) => {
          const value = sortBy === 'orders' ? dish.orderCount : dish.revenue;
          const percentage = (value / maxValue) * 100;
          
          return (
            <div key={dish.id} className="mb-3 last:mb-0">
              <div className="flex justify-between text-sm mb-1">
                <div className="font-medium truncate max-w-[60%]">{dish.name}</div>
                <div className="text-gray-500">
                  {sortBy === 'orders' 
                    ? `${dish.orderCount} orders` 
                    : formatCurrency(dish.revenue)}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 
'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { fallbackLng } from '@/i18n/settings';

type MenuItem = {
  id: string;
  name: string | { en: string; vi: string };
  image: string;
  count: number;
  revenue: number;
  category?: string;
};

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function BestSellingItems() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const lng = params?.lng as string || 'vi'; // Default to Vietnamese if language not found

  // Helper function to safely get the dish name in the correct language
  const getDishName = useCallback((dish: MenuItem): string => {
    if (!dish.name) return 'Unknown Dish';
    
    // If name is a string, return it directly
    if (typeof dish.name === 'string') return dish.name;
    
    // If name is an object with language keys, return the appropriate one
    if (typeof dish.name === 'object') {
      // Try to get the current language version
      const localizedName = dish.name[lng as keyof typeof dish.name];
      if (localizedName) return localizedName;
      
      // Fallback to any available language
      if (dish.name[lng as keyof typeof dish.name]) return dish.name[lng as keyof typeof dish.name];
      if (dish.name[fallbackLng as keyof typeof dish.name]) return dish.name[fallbackLng as keyof typeof dish.name];
      
      // If no language versions found, return a default
      return 'Unnamed Dish';
    }
    
    // Fallback for any other case
    return String(dish.name);
  }, [lng]);

  // Helper function to get a safe image path
  const getImagePath = (dish: MenuItem): string => {
    if (dish.image && dish.image.startsWith('http')) {
      return dish.image;
    }
    
    if (dish.image) {
      return dish.image;
    }
    
    // Generate a path based on the dish name
    const dishName = typeof dish.name === 'string' 
      ? dish.name 
      : (dish.name[lng as keyof typeof dish.name] || dish.name[fallbackLng as keyof typeof dish.name] || 'unknown');
      
    return `/menu/${dishName.toLowerCase().replace(/\s+/g, '-')}.jpg`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching popular dishes data from API');
        const response = await axios.get(`${BASE_API_URL}/api/analytics/dishes/popular`, {
          params: { timeRange: 'month' },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        // Process API data
        const apiData = response.data.data || response.data;
        console.log('API response:', apiData);
        
        // Process and enhance with image paths if needed
        const processedData = apiData.map((item: unknown) => {
          const dish = item as MenuItem;
          if (!dish.image) {
            const name = getDishName(dish);
            dish.image = `/menu/${name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
          }
          return dish;
        });
        
        setItems(processedData);
        setLoading(false);
      } catch (err: unknown) {
        const error = err as { message?: string };
        console.error('Error fetching popular dishes:', error);
        setError(error.message || 'Failed to load popular dishes');
        setLoading(false);
        
        // Fallback to empty data instead of mock data
        setItems([]);
      }
    };

    fetchData();
  }, [lng, getDishName]);

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }
  
  if (items.length === 0) {
    return <div className="flex justify-center items-center h-full">No popular dishes data available</div>;
  }

  // Format number as VND currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="h-full overflow-y-auto">
      <ul className="divide-y divide-gray-200">
        {items.map((item) => (
          <li key={item.id} className="py-3 flex items-center">
            <div className="relative h-16 w-16 rounded-md overflow-hidden mr-4 bg-gray-100">
              <Image
                src={getImagePath(item)}
                alt={getDishName(item)}
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{getDishName(item)}</p>
              <p className="text-sm text-gray-500">{formatCurrency(item.revenue / item.count)}</p>
              {item.category && (
                <div className="flex items-center mt-1">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                </div>
              )}
            </div>
            <div className="text-center ml-4">
              <div className="text-lg font-semibold">{item.count}</div>
              <div className="text-xs text-gray-500">orders</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 
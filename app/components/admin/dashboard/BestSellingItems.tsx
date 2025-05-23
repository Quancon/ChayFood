'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';

type MenuItem = {
  id: string;
  name: string;
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
        
        // Process and enhance with image paths
        const processedData = apiData.map((item: any) => ({
          ...item,
          image: `/menu/${item.name.toLowerCase().replace(/\s+/g, '-')}.jpg`
        }));
        
        setItems(processedData);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching popular dishes:', err);
        setError(err.message || 'Failed to load popular dishes');
        setLoading(false);
        
        // Fallback to empty data instead of mock data
        setItems([]);
      }
    };

    fetchData();
  }, []);

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
                src={item.image}
                alt={item.name}
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
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
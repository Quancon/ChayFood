'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';

type MenuItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  orderCount: number;
  category: string;
};

export default function BestSellingItems() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real implementation, you would fetch data from your API
        // For now, we'll use mock data
        // const response = await axios.get('/api/admin/best-selling');
        // setItems(response.data);
        
        // Mock data
        const mockData: MenuItem[] = [
          { 
            id: '1', 
            name: 'Vegan Pho', 
            image: '/menu/vegan-pho.jpg', 
            price: 98000, 
            orderCount: 142,
            category: 'main'
          },
          { 
            id: '2', 
            name: 'Tofu Rice Bowl', 
            image: '/menu/tofu-rice.jpg', 
            price: 85000, 
            orderCount: 128,
            category: 'main'
          },
          { 
            id: '3', 
            name: 'Mushroom Spring Rolls', 
            image: '/menu/spring-rolls.jpg', 
            price: 65000, 
            orderCount: 112,
            category: 'side'
          },
          { 
            id: '4', 
            name: 'Coconut Smoothie', 
            image: '/menu/coconut-smoothie.jpg', 
            price: 45000, 
            orderCount: 96,
            category: 'beverage'
          },
          { 
            id: '5', 
            name: 'Mango Sticky Rice', 
            image: '/menu/mango-sticky-rice.jpg', 
            price: 55000, 
            orderCount: 89,
            category: 'dessert'
          },
        ];
        
        setItems(mockData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching best selling items:', err);
        setError('Failed to load best selling items');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
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
              <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
              <div className="flex items-center mt-1">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                  {item.category}
                </span>
              </div>
            </div>
            <div className="text-center ml-4">
              <div className="text-lg font-semibold">{item.orderCount}</div>
              <div className="text-xs text-gray-500">orders</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 
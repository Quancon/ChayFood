'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'main' | 'side' | 'dessert' | 'beverage';
  image: string;
  isAvailable: boolean;
  nutritionInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  preparationTime: number;
};

export default function MenuItemsList() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real implementation, you would fetch data from your API
        // For now, we'll use mock data
        // const response = await axios.get('/api/admin/menu-items');
        // setMenuItems(response.data);
        
        // Mock data
        const mockData: MenuItem[] = [
          { 
            id: '1', 
            name: 'Vegan Pho', 
            description: 'Traditional Vietnamese soup with rice noodles, tofu, and vegetables',
            image: '/menu/vegan-pho.jpg', 
            price: 98000,
            category: 'main',
            isAvailable: true,
            nutritionInfo: {
              calories: 320,
              protein: 12,
              carbs: 45,
              fat: 6
            },
            preparationTime: 15
          },
          { 
            id: '2', 
            name: 'Tofu Rice Bowl', 
            description: 'Crispy tofu with steamed rice, fresh vegetables and spicy sauce',
            image: '/menu/tofu-rice.jpg', 
            price: 85000,
            category: 'main',
            isAvailable: true,
            nutritionInfo: {
              calories: 420,
              protein: 18,
              carbs: 60,
              fat: 10
            },
            preparationTime: 12
          },
          { 
            id: '3', 
            name: 'Mushroom Spring Rolls', 
            description: 'Fresh spring rolls filled with mushrooms, carrots, cucumber and herbs',
            image: '/menu/spring-rolls.jpg', 
            price: 65000,
            category: 'side',
            isAvailable: true,
            nutritionInfo: {
              calories: 220,
              protein: 6,
              carbs: 28,
              fat: 8
            },
            preparationTime: 10
          },
          { 
            id: '4', 
            name: 'Coconut Smoothie', 
            description: 'Refreshing coconut smoothie with a hint of vanilla',
            image: '/menu/coconut-smoothie.jpg', 
            price: 45000,
            category: 'beverage',
            isAvailable: true,
            nutritionInfo: {
              calories: 180,
              protein: 3,
              carbs: 22,
              fat: 8
            },
            preparationTime: 5
          },
          { 
            id: '5', 
            name: 'Mango Sticky Rice', 
            description: 'Sweet sticky rice with fresh mango and coconut cream',
            image: '/menu/mango-sticky-rice.jpg', 
            price: 55000,
            category: 'dessert',
            isAvailable: false,
            nutritionInfo: {
              calories: 320,
              protein: 4,
              carbs: 65,
              fat: 6
            },
            preparationTime: 8
          },
        ];
        
        setMenuItems(mockData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setError('Failed to load menu items');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleToggleAvailability = (id: string) => {
    setMenuItems(items => 
      items.map(item => 
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  // Filter items based on category and search query
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Format number as VND currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const categoryLabels = {
    main: 'Main Dish',
    side: 'Side Dish',
    dessert: 'Dessert',
    beverage: 'Beverage'
  };

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search menu items..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      
      <div className="flex mb-4 space-x-2">
        <button
          onClick={() => handleCategoryChange(null)}
          className={`px-3 py-1 rounded-md ${
            selectedCategory === null ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          All
        </button>
        {['main', 'side', 'dessert', 'beverage'].map(category => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-3 py-1 rounded-md ${
              selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {categoryLabels[category as keyof typeof categoryLabels]}
          </button>
        ))}
      </div>
      
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Image</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Prep Time</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No menu items found. Try a different search or category.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-3 pr-3">
                    <div className="relative h-12 w-12 rounded-md overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-gray-500 truncate max-w-[200px]">{item.description}</div>
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm text-gray-500">
                    {categoryLabels[item.category]}
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm text-gray-500">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                    <button
                      onClick={() => handleToggleAvailability(item.id)}
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm text-gray-500">
                    {item.preparationTime} min
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm text-gray-500">
                    <div className="flex space-x-3">
                      <Link href={`/admin/menu/view/${item.id}`} className="text-blue-500 hover:text-blue-700">
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <Link href={`/admin/menu/edit/${item.id}`} className="text-amber-500 hover:text-amber-700">
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button className="text-red-500 hover:text-red-700">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'main', name: 'Main Dishes' },
  { id: 'side', name: 'Side Dishes' },
  { id: 'dessert', name: 'Desserts' },
  { id: 'beverage', name: 'Beverages' },
];

export default function CategoryFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  const currentCategory = searchParams.get('category') || 'all';

  function handleCategoryChange(category: string) {
    const params = new URLSearchParams(searchParams);
    
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryChange(category.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            currentCategory === category.id
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
} 
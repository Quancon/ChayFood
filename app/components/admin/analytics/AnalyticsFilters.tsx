'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

const timeRanges = [
  { id: 'day', name: 'Today' },
  { id: 'week', name: 'This Week' },
  { id: 'month', name: 'This Month' },
  { id: 'quarter', name: 'This Quarter' },
  { id: 'year', name: 'This Year' },
  { id: 'custom', name: 'Custom Range' },
];

const regions = [
  { id: 'all', name: 'All Regions' },
  { id: 'north', name: 'North' },
  { id: 'central', name: 'Central' },
  { id: 'south', name: 'South' },
];

const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'main', name: 'Main Dishes' },
  { id: 'side', name: 'Side Dishes' },
  { id: 'dessert', name: 'Desserts' },
  { id: 'beverage', name: 'Beverages' },
];

export default function AnalyticsFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const currentRange = searchParams.get('range') || 'month';
  const currentRegion = searchParams.get('region') || 'all';
  const currentCategory = searchParams.get('category') || 'all';

  function handleRangeChange(range: string) {
    const params = new URLSearchParams(searchParams);
    
    if (range === 'custom') {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(false);
      params.set('range', range);
      // Delete custom date params if they exist
      params.delete('start');
      params.delete('end');
      replace(`${pathname}?${params.toString()}`);
    }
  }

  function handleRegionChange(region: string) {
    const params = new URLSearchParams(searchParams);
    params.set('region', region);
    replace(`${pathname}?${params.toString()}`);
  }
  
  function handleCategoryChange(category: string) {
    const params = new URLSearchParams(searchParams);
    params.set('category', category);
    replace(`${pathname}?${params.toString()}`);
  }
  
  function handleDateSubmit() {
    if (startDate && endDate) {
      const params = new URLSearchParams(searchParams);
      params.set('range', 'custom');
      params.set('start', startDate);
      params.set('end', endDate);
      replace(`${pathname}?${params.toString()}`);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div>
          <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-1">
            Time Range
          </label>
          <div className="inline-flex rounded-md shadow-sm">
            {timeRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => handleRangeChange(range.id)}
                className={`px-4 py-2 text-sm font-medium ${
                  range.id === currentRange
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } ${
                  range.id === timeRanges[0].id
                    ? 'rounded-l-md'
                    : range.id === timeRanges[timeRanges.length - 1].id
                    ? 'rounded-r-md'
                    : ''
                } border border-gray-300`}
              >
                {range.name}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
            Region
          </label>
          <select
            id="region"
            value={currentRegion}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          >
            {regions.map((region) => (
              <option key={region.id} value={region.id}>{region.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={currentCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      {showDatePicker && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex items-end gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <button
              onClick={handleDateSubmit}
              disabled={!startDate || !endDate}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
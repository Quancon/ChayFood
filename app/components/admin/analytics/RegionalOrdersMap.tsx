'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type RegionData = {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  change: number;
};

export default function RegionalOrdersMap() {
  const searchParams = useSearchParams();
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metric, setMetric] = useState<'orders' | 'revenue'>('orders');
  
  const timeRange = searchParams.get('range') || 'month';
  const category = searchParams.get('category') || 'all';
  const startDate = searchParams.get('start');
  const endDate = searchParams.get('end');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real implementation, you would fetch data from your API
        // For now, we'll simulate an API call with mock data
        console.log('Fetching regional data with filters:', { timeRange, category, startDate, endDate });
        
        // Simulate API request delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        const mockData: RegionData[] = [
          { id: 'north', name: 'North', orders: 438, revenue: 44850000, change: 12.3 },
          { id: 'central', name: 'Central', orders: 391, revenue: 38450000, change: 8.7 },
          { id: 'south', name: 'South', orders: 419, revenue: 42150000, change: 10.2 },
        ];
        
        setRegions(mockData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching regional orders data:', err);
        setError('Failed to load regional data');
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, category, startDate, endDate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const formatPercentage = (value: number) => {
    return (value > 0 ? '+' : '') + value.toFixed(1) + '%';
  };

  const getClassName = (id: string) => {
    return id === 'north' ? 'bg-blue-100' : 
           id === 'central' ? 'bg-green-100' : 'bg-yellow-100';
  };

  const getTextColor = (id: string) => {
    return id === 'north' ? 'text-blue-800' : 
           id === 'central' ? 'text-green-800' : 'text-yellow-800';
  };

  if (loading) {
    return <div className="h-full flex justify-center items-center">Loading regional data...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (regions.length === 0) {
    return <div className="text-gray-500">No regional data available</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Regional Distribution
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMetric('orders')}
            className={`px-3 py-1 text-xs rounded-full ${
              metric === 'orders' 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setMetric('revenue')}
            className={`px-3 py-1 text-xs rounded-full ${
              metric === 'revenue' 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Revenue
          </button>
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="text-sm font-medium text-gray-700 mb-4">Regional Map</div>
          <div className="relative w-full h-64 border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="flex justify-center items-center h-full text-sm text-gray-500">
              A map visualization would be displayed here showing regional distribution of orders/revenue across Vietnam.
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="text-sm font-medium text-gray-700 mb-4">Regional Breakdown</div>
          <div className="space-y-4">
            {regions.map((region) => (
              <div key={region.id} className={`p-3 rounded-lg ${getClassName(region.id)}`}>
                <div className="flex justify-between items-center">
                  <div className={`font-medium ${getTextColor(region.id)}`}>{region.name}</div>
                  <div className={`text-sm ${getTextColor(region.id)}`}>
                    {formatPercentage(region.change)}
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-sm text-gray-600">{metric === 'orders' ? 'Orders' : 'Revenue'}</div>
                  <div className="text-lg font-bold">
                    {metric === 'orders' ? region.orders : formatCurrency(region.revenue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
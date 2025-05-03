'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

type DataPoint = {
  date: string;
  revenue: number;
};

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function RevenueChart() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching revenue data from API');
        const response = await axios.get(`${BASE_API_URL}/api/analytics/orders/trends`, {
          params: { timeRange: 'week' },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        // Process API data
        const apiData = response.data.data || response.data;
        console.log('API response:', apiData);
        
        const processedData = apiData.map((item: any) => ({
          date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: item.revenue
        }));
        
        setData(processedData);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching revenue data:', err);
        setError(err.message || 'Failed to load revenue data');
        setLoading(false);
        
        // Fallback to empty data instead of mock data
        setData([]);
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
  
  if (data.length === 0) {
    return <div className="flex justify-center items-center h-full">No revenue data available</div>;
  }

  const maxRevenue = Math.max(...data.map(item => item.revenue));
  
  // Format number as VND currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-sm text-gray-500">Total Revenue</div>
          <div className="text-xl font-semibold">
            {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0))}
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex items-end">
        {data.map((item, index) => (
          <div 
            key={index} 
            className="flex-1 flex flex-col items-center justify-end h-full"
          >
            <div className="relative flex flex-col items-center group">
              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {formatCurrency(item.revenue)}
              </div>
              <div 
                className="w-12 bg-blue-500 rounded-t-md transition-all duration-300 hover:bg-blue-600"
                style={{ 
                  height: `${(item.revenue / maxRevenue) * 100}%`,
                  minHeight: '20px'
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-2">{item.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 
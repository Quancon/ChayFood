'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

type DataPoint = {
  date: string;
  revenue: number;
};

export default function RevenueChart() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real implementation, you would fetch data from your API
        // For now, we'll use mock data
        // const response = await axios.get('/api/admin/revenue');
        // setData(response.data);
        
        // Mock data
        const mockData: DataPoint[] = [
          { date: 'Mon', revenue: 1250000 },
          { date: 'Tue', revenue: 1120000 },
          { date: 'Wed', revenue: 1450000 },
          { date: 'Thu', revenue: 1680000 },
          { date: 'Fri', revenue: 2100000 },
          { date: 'Sat', revenue: 1890000 },
          { date: 'Sun', revenue: 1350000 },
        ];
        
        setData(mockData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching revenue data:', err);
        setError('Failed to load revenue data');
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
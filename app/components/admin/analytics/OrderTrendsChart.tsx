'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type DataPoint = {
  date: string;
  orders: number;
  revenue: number;
};

export default function OrderTrendsChart() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metric, setMetric] = useState<'orders' | 'revenue'>('orders');
  
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
        // In a real implementation, you would fetch data from your API
        // For now, we'll simulate an API call with mock data
        console.log('Fetching order trends with filters:', { timeRange, region, category, startDate, endDate });
        
        // Simulate API request delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Generate mock data based on the time range
        const mockData: DataPoint[] = [];
        
        if (timeRange === 'day') {
          // Hours for today
          for (let i = 0; i < 24; i++) {
            const hour = i < 10 ? `0${i}:00` : `${i}:00`;
            mockData.push({
              date: hour,
              orders: Math.floor(Math.random() * 20) + 5,
              revenue: (Math.floor(Math.random() * 20) + 5) * 100000
            });
          }
        } else if (timeRange === 'week') {
          // Days of the week
          const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          days.forEach(day => {
            mockData.push({
              date: day,
              orders: Math.floor(Math.random() * 50) + 20,
              revenue: (Math.floor(Math.random() * 50) + 20) * 100000
            });
          });
        } else {
          // Last 30 days for month view
          for (let i = 30; i >= 1; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            mockData.push({
              date: `${date.getDate()}/${date.getMonth() + 1}`,
              orders: Math.floor(Math.random() * 80) + 40,
              revenue: (Math.floor(Math.random() * 80) + 40) * 100000
            });
          }
        }
        
        setData(mockData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order trends:', err);
        setError('Failed to load trend data');
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
  
  // Get maximum value for the selected metric for chart scaling
  const maxValue = Math.max(
    ...data.map(item => metric === 'orders' ? item.orders : item.revenue)
  );
  
  // Calculate totals and averages
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const avgOrders = totalOrders / (data.length || 1);
  const avgRevenue = totalRevenue / (data.length || 1);

  if (loading) {
    return <div className="h-full flex justify-center items-center">Loading trend data...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (data.length === 0) {
    return <div className="text-gray-500">No trend data available</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <div className="text-sm text-gray-500">
            {timeRange === 'day' ? 'Today' : timeRange === 'week' ? 'This Week' : 'Last 30 Days'} -
            {metric === 'orders' 
              ? ` ${totalOrders} orders (avg: ${avgOrders.toFixed(1)}/day)` 
              : ` ${formatCurrency(totalRevenue)} (avg: ${formatCurrency(avgRevenue)}/day)`}
          </div>
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
      
      <div className="flex-1 flex items-end">
        <div className="h-full w-full flex">
          {/* Y-axis labels */}
          <div className="pr-2 flex flex-col justify-between text-xs text-gray-500 w-16">
            {[0, 1, 2, 3, 4].map((_, index) => (
              <div key={index} className="text-right">
                {metric === 'orders' 
                  ? Math.round(maxValue * (4 - index) / 4)
                  : formatCurrency(maxValue * (4 - index) / 4)}
              </div>
            ))}
          </div>
          
          {/* Chart bars */}
          <div className="flex-1 flex items-end relative">
            {/* Horizontal grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 1, 2, 3, 4].map((_, index) => (
                <div 
                  key={index} 
                  className="w-full h-px bg-gray-200"
                  style={{
                    position: 'absolute',
                    top: `${(index * 100) / 4}%`,
                    left: 0
                  }}
                ></div>
              ))}
            </div>
            
            {/* Bars */}
            <div className="relative z-10 w-full flex items-end h-full">
              {data.map((item, index) => {
                const value = metric === 'orders' ? item.orders : item.revenue;
                const percentage = (value / maxValue) * 100;
                
                return (
                  <div 
                    key={index} 
                    className="flex-1 flex flex-col items-center justify-end mx-0.5 group"
                  >
                    <div className="relative h-full w-full flex flex-col items-center justify-end">
                      <div className="absolute bottom-full mb-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none">
                        {metric === 'orders' 
                          ? `${item.orders} orders` 
                          : formatCurrency(item.revenue)}
                      </div>
                      <div 
                        className={`w-full max-w-[20px] rounded-t ${
                          metric === 'orders' ? 'bg-blue-500' : 'bg-green-500'
                        } hover:opacity-80 transition-opacity`}
                        style={{ 
                          height: `${percentage}%`,
                          minHeight: '4px'
                        }}
                      ></div>
                    </div>
                    {/* Only show every nth label for dense charts */}
                    {(data.length <= 14 || index % Math.ceil(data.length / 14) === 0) && (
                      <div className="text-xs text-gray-500 mt-1 truncate" style={{ maxWidth: '40px' }}>
                        {item.date}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
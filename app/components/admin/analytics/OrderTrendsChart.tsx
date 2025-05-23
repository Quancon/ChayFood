'use client';

import { useAnalytics } from '@/context/AnalyticsContext';

export default function OrderTrendsChart() {
  const { orderTrends, isLoading, error } = useAnalytics();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return <div className="h-full flex justify-center items-center">Loading trend data...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!orderTrends || orderTrends.length === 0) {
    return <div className="text-gray-500">No trend data available</div>;
  }

  const maxOrders = Math.max(...orderTrends.map(day => day.orders));
  const maxRevenue = Math.max(...orderTrends.map(day => day.revenue));

  return (
    <div className="h-64">
      <div className="flex h-full">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between pr-2 text-xs text-gray-500">
          <span>{maxOrders}</span>
          <span>{Math.round(maxOrders * 0.75)}</span>
          <span>{Math.round(maxOrders * 0.5)}</span>
          <span>{Math.round(maxOrders * 0.25)}</span>
          <span>0</span>
        </div>
        
        {/* Chart area */}
        <div className="flex-1 flex">
          {orderTrends.map((day, index) => (
            <div key={day.date} className="flex-1 flex flex-col">
              <div className="flex-1 flex items-end relative">
                {/* Revenue line point */}
                <div 
                  className="absolute w-2 h-2 bg-yellow-500 rounded-full transform -translate-x-1"
                  style={{ 
                    bottom: `${(day.revenue / maxRevenue) * 100}%`, 
                    left: '50%'
                  }}
                  title={`Revenue: ${formatCurrency(day.revenue)}`}
                ></div>
                
                {/* Orders bar */}
                <div 
                  className="w-full bg-blue-500 mx-1 rounded-t"
                  style={{ height: `${(day.orders / maxOrders) * 100}%` }}
                  title={`Orders: ${day.orders}`}
                ></div>
              </div>
              
              {/* X-axis label */}
              <div className="text-xs text-center mt-2 text-gray-600">
                {formatDate(day.date)}
              </div>
            </div>
          ))}
        </div>
        
        {/* Right Y-axis for revenue */}
        <div className="flex flex-col justify-between pl-2 text-xs text-gray-500">
          <span>{formatCurrency(maxRevenue)}</span>
          <span>{formatCurrency(maxRevenue * 0.75)}</span>
          <span>{formatCurrency(maxRevenue * 0.5)}</span>
          <span>{formatCurrency(maxRevenue * 0.25)}</span>
          <span>0</span>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center mt-4 text-xs">
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
          <span>Orders</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
          <span>Revenue</span>
        </div>
      </div>
    </div>
  );
} 
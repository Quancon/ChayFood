'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type OrderStats = {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  completedOrders: number;
  cancelledOrders: number;
  percentChange: {
    orders: number;
    revenue: number;
    aov: number;
  };
};

export default function OrderStatistics() {
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
        // In a real implementation, you would fetch data from your API with the filter parameters
        // For now, we'll simulate an API call with mock data
        console.log('Fetching order stats with filters:', { timeRange, region, category, startDate, endDate });
        
        // Simulate API request delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        const mockStats: OrderStats = {
          totalOrders: 1248,
          totalRevenue: 125450000, // in VND
          averageOrderValue: 100520, // in VND
          completedOrders: 1150,
          cancelledOrders: 38,
          percentChange: {
            orders: 8.5,
            revenue: 12.3,
            aov: 3.8
          }
        };
        
        setStats(mockStats);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order statistics:', err);
        setError('Failed to load statistics');
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

  const formatPercentage = (value: number) => {
    return (value > 0 ? '+' : '') + value.toFixed(1) + '%';
  };

  if (loading) {
    return <div className="h-full flex justify-center items-center">Loading statistics...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!stats) {
    return <div className="text-gray-500">No data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Total Orders</div>
          <div className="text-2xl font-semibold">{stats.totalOrders}</div>
          <div className={`text-xs mt-1 ${stats.percentChange.orders >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(stats.percentChange.orders)}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Total Revenue</div>
          <div className="text-2xl font-semibold">{formatCurrency(stats.totalRevenue)}</div>
          <div className={`text-xs mt-1 ${stats.percentChange.revenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(stats.percentChange.revenue)}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Average Order Value</div>
          <div className="text-2xl font-semibold">{formatCurrency(stats.averageOrderValue)}</div>
          <div className={`text-xs mt-1 ${stats.percentChange.aov >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(stats.percentChange.aov)}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-500">Order Status</div>
              <div className="text-lg font-medium mt-1">
                <span className="text-green-600">{stats.completedOrders}</span> /
                <span className="text-red-600 ml-1">{stats.cancelledOrders}</span>
              </div>
            </div>
            <div className="w-16 h-16">
              <div className="relative w-full h-full">
                {/* Simple donut chart SVG */}
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeDasharray={`${(stats.completedOrders / stats.totalOrders) * 100}, 100`}
                    strokeLinecap="round"
                  />
                  <text x="18" y="20.5" textAnchor="middle" className="text-xs font-medium">
                    {Math.round((stats.completedOrders / stats.totalOrders) * 100)}%
                  </text>
                </svg>
                <div className="text-xs text-gray-500 mt-1 text-center">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
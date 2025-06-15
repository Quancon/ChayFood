'use client';

import { useAnalytics } from '@/[lng]/(default)/context/AnalyticsContext';

export default function OrderStatistics() {
  const { orderStats, isLoading, error } = useAnalytics();

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

  if (isLoading) {
    return <div className="h-full flex justify-center items-center">Loading statistics...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!orderStats) {
    return <div className="text-gray-500">No data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Total Orders</div>
          <div className="text-2xl font-semibold">{orderStats.totalOrders}</div>
          <div className={`text-xs mt-1 ${orderStats.percentChange.orders >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(orderStats.percentChange.orders)}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Total Revenue</div>
          <div className="text-2xl font-semibold">{formatCurrency(orderStats.totalRevenue)}</div>
          <div className={`text-xs mt-1 ${orderStats.percentChange.revenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(orderStats.percentChange.revenue)}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Average Order Value</div>
          <div className="text-2xl font-semibold">{formatCurrency(orderStats.averageOrderValue)}</div>
          <div className={`text-xs mt-1 ${orderStats.percentChange.aov >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(orderStats.percentChange.aov)}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-500">Order Status</div>
              <div className="text-lg font-medium mt-1">
                <span className="text-green-600">{orderStats.completedOrders}</span> /
                <span className="text-red-600 ml-1">{orderStats.cancelledOrders}</span>
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
                    strokeDasharray={`${(orderStats.completedOrders / orderStats.totalOrders) * 100}, 100`}
                    strokeLinecap="round"
                  />
                  <text x="18" y="20.5" textAnchor="middle" className="text-xs font-medium">
                    {Math.round((orderStats.completedOrders / orderStats.totalOrders) * 100)}%
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
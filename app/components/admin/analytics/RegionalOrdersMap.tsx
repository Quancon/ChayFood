'use client';

import { useAnalytics } from '@/[lng]/context/AnalyticsContext';

export default function RegionalOrdersMap() {
  const { regionalData, isLoading, error } = useAnalytics();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return <div className="h-full flex justify-center items-center">Loading regional data...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!regionalData || regionalData.length === 0) {
    return <div className="text-gray-500">No regional data available</div>;
  }

  // Calculate total for percentage
  const totalOrders = regionalData.reduce((sum, region) => sum + region.count, 0);
  const totalRevenue = regionalData.reduce((sum, region) => sum + region.revenue, 0);

  // Get percentage for region
  const getPercentage = (count: number) => {
    return ((count / totalOrders) * 100).toFixed(1);
  };

  // Get color intensity based on percentage
  const getColorIntensity = (count: number) => {
    const percentage = (count / totalOrders) * 100;
    if (percentage > 40) return 'bg-blue-700';
    if (percentage > 30) return 'bg-blue-600';
    if (percentage > 20) return 'bg-blue-500';
    if (percentage > 10) return 'bg-blue-400';
    return 'bg-blue-300';
  };

  return (
    <div className="h-full">
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <div className="flex space-x-2 text-sm text-gray-600">
            <div className="font-medium">Total orders:</div>
            <div>{totalOrders}</div>
          </div>
          <div className="flex space-x-2 text-sm text-gray-600">
            <div className="font-medium">Total revenue:</div>
            <div>{formatCurrency(totalRevenue)}</div>
          </div>
        </div>
        
        <div className="flex-1 grid grid-cols-1 gap-3">
          {regionalData.map((region) => (
            <div key={region.region} className="border rounded-lg overflow-hidden">
              <div className="flex items-center p-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getColorIntensity(region.count)} text-white font-bold`}>
                  {region.region.charAt(0)}
                </div>
                <div className="ml-3">
                  <div className="font-medium">{region.region}</div>
                  <div className="text-sm text-gray-500">
                    {getPercentage(region.count)}% of orders
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="font-medium">{region.count} orders</div>
                  <div className="text-sm text-gray-500">{formatCurrency(region.revenue)}</div>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200">
                <div 
                  className={`h-full ${getColorIntensity(region.count)}`} 
                  style={{ width: `${getPercentage(region.count)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
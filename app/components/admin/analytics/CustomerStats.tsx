'use client';

import { useAnalytics } from '@/context/AnalyticsContext';

export default function CustomerStats() {
  const { customerStats, isLoading, error } = useAnalytics();

  const formatPercentage = (value: number) => {
    return (value > 0 ? '+' : '') + value.toFixed(1) + '%';
  };

  if (isLoading) {
    return <div className="h-full flex justify-center items-center">Loading customer data...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!customerStats) {
    return <div className="text-gray-500">No customer data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Total Customers</div>
          <div className="text-2xl font-semibold">{customerStats.totalCustomers}</div>
          <div className={`text-xs mt-1 ${customerStats.percentChange.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(customerStats.percentChange.total)}
          </div>
        </div>
        
        <div className="flex space-x-4">
          <div className="bg-gray-50 p-4 rounded-lg flex-1">
            <div className="text-sm text-gray-500">New Customers</div>
            <div className="text-xl font-semibold">{customerStats.newCustomers}</div>
            <div className={`text-xs mt-1 ${customerStats.percentChange.new >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(customerStats.percentChange.new)}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg flex-1">
            <div className="text-sm text-gray-500">Repeat Customers</div>
            <div className="text-xl font-semibold">{customerStats.repeatCustomers}</div>
            <div className={`text-xs mt-1 ${customerStats.percentChange.repeat >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(customerStats.percentChange.repeat)}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500 mb-2">Customer Distribution</div>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                  New
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {Math.round((customerStats.newCustomers / customerStats.totalCustomers) * 100)}%
                </span>
              </div>
            </div>
            <div className="flex h-2 mb-4 overflow-hidden text-xs bg-blue-200 rounded">
              <div
                style={{ width: `${(customerStats.newCustomers / customerStats.totalCustomers) * 100}%` }}
                className="flex flex-col justify-center text-center text-white bg-blue-500 shadow-none whitespace-nowrap"
              ></div>
            </div>
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-teal-600 bg-teal-200">
                  Repeat
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-teal-600">
                  {Math.round((customerStats.repeatCustomers / customerStats.totalCustomers) * 100)}%
                </span>
              </div>
            </div>
            <div className="flex h-2 overflow-hidden text-xs bg-teal-200 rounded">
              <div
                style={{ width: `${(customerStats.repeatCustomers / customerStats.totalCustomers) * 100}%` }}
                className="flex flex-col justify-center text-center text-white bg-teal-500 shadow-none whitespace-nowrap"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
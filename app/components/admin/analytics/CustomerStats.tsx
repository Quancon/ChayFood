'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type CustomerStats = {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  avgOrdersPerCustomer: number;
  customerRetentionRate: number;
  percentChange: {
    newCustomers: number;
    returningCustomers: number;
  };
};

export default function CustomerStats() {
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const timeRange = searchParams.get('range') || 'month';
  const region = searchParams.get('region') || 'all';
  const startDate = searchParams.get('start');
  const endDate = searchParams.get('end');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real implementation, you would fetch data from your API
        // For now, we'll simulate an API call with mock data
        console.log('Fetching customer stats with filters:', { timeRange, region, startDate, endDate });
        
        // Simulate API request delay
        await new Promise(resolve => setTimeout(resolve, 700));
        
        // Mock data
        const mockStats: CustomerStats = {
          totalCustomers: 842,
          newCustomers: 128,
          returningCustomers: 714,
          avgOrdersPerCustomer: 1.48,
          customerRetentionRate: 68.5,
          percentChange: {
            newCustomers: 15.8,
            returningCustomers: 4.2
          }
        };
        
        setStats(mockStats);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching customer statistics:', err);
        setError('Failed to load customer data');
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, region, startDate, endDate]);

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
    return <div className="text-gray-500">No customer data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">New Customers</div>
          <div className="text-2xl font-semibold">{stats.newCustomers}</div>
          <div className={`text-xs mt-1 ${stats.percentChange.newCustomers >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(stats.percentChange.newCustomers)}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Returning Customers</div>
          <div className="text-2xl font-semibold">{stats.returningCustomers}</div>
          <div className={`text-xs mt-1 ${stats.percentChange.returningCustomers >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(stats.percentChange.returningCustomers)}
          </div>
        </div>
      </div>
      
      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="flex justify-between">
          <div>
            <div className="text-sm text-purple-700">Retention Rate</div>
            <div className="text-2xl font-semibold text-purple-900">{stats.customerRetentionRate}%</div>
          </div>
          
          <div className="w-16 h-16">
            <div className="relative w-full h-full">
              {/* Simple donut chart SVG */}
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f3e8ff"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="3"
                  strokeDasharray={`${stats.customerRetentionRate}, 100`}
                  strokeLinecap="round"
                />
                <text x="18" y="20.5" textAnchor="middle" className="text-xs font-medium">
                  {Math.round(stats.customerRetentionRate)}%
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm text-gray-500">Avg. Orders per Customer</div>
        <div className="text-2xl font-semibold">{stats.avgOrdersPerCustomer.toFixed(2)}</div>
        <div className="mt-2 text-xs text-gray-500">
          Total customers: {stats.totalCustomers}
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm font-medium mb-2">Customer Composition</div>
        <div className="relative pt-1">
          <div className="overflow-hidden h-4 text-xs flex rounded bg-gray-200">
            <div
              style={{ width: `${(stats.newCustomers / stats.totalCustomers) * 100}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
            ></div>
            <div
              style={{ width: `${(stats.returningCustomers / stats.totalCustomers) * 100}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
            ></div>
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
            <span>New ({Math.round((stats.newCustomers / stats.totalCustomers) * 100)}%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
            <span>Returning ({Math.round((stats.returningCustomers / stats.totalCustomers) * 100)}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
} 
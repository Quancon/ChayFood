'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import MetricCard from './MetricCard';
import { 
  ArrowTrendingUpIcon, 
  ShoppingCartIcon, 
  UsersIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';

type DashboardMetrics = {
  totalRevenue: number;
  revenueChange: number;
  ordersToday: number;
  ordersChange: number;
  newCustomers: number;
  customersChange: number;
  avgDeliveryTime: number;
  deliveryTimeChange: number;
};

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function DashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching dashboard metrics from API');
        const response = await axios.get(`${BASE_API_URL}/api/admin/dashboard/metrics`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        const apiData = response.data.data || response.data;
        console.log('Dashboard metrics API response:', apiData);
        
        setMetrics(apiData as DashboardMetrics);
        setLoading(false);
      } catch (err: unknown) {
        console.error('Error fetching dashboard metrics:', err);
        if (err instanceof Error) {
          setError(err.message || 'Failed to load dashboard metrics');
        } else {
          setError('Failed to load dashboard metrics');
        }
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format number as VND currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format percentage change
  const formatChange = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error || !metrics) {
    // Fallback to sensible defaults if there's an error
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Total Revenue" 
          value="₫0" 
          change="0%" 
          trend="neutral"
          icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
          color="bg-green-100"
          textColor="text-green-800"
          iconColor="text-green-500"
        />
        <MetricCard 
          title="Orders Today" 
          value="0" 
          change="0%" 
          trend="neutral"
          icon={<ShoppingCartIcon className="h-6 w-6" />}
          color="bg-blue-100"
          textColor="text-blue-800"
          iconColor="text-blue-500"
        />
        <MetricCard 
          title="New Customers" 
          value="0" 
          change="0%" 
          trend="neutral"
          icon={<UsersIcon className="h-6 w-6" />}
          color="bg-purple-100"
          textColor="text-purple-800"
          iconColor="text-purple-500"
        />
        <MetricCard 
          title="Avg. Delivery Time" 
          value="0 min" 
          change="0%" 
          trend="neutral"
          icon={<ClockIcon className="h-6 w-6" />}
          color="bg-amber-100"
          textColor="text-amber-800"
          iconColor="text-amber-500"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard 
        title="Total Revenue" 
        value={formatCurrency(metrics.totalRevenue)} 
        change={formatChange(metrics.revenueChange)} 
        trend={metrics.revenueChange > 0 ? "up" : metrics.revenueChange < 0 ? "down" : "neutral"}
        icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
        color="bg-green-100"
        textColor="text-green-800"
        iconColor="text-green-500"
      />
      
      <MetricCard 
        title="Orders Today" 
        value={metrics.ordersToday.toString()} 
        change={formatChange(metrics.ordersChange)} 
        trend={metrics.ordersChange > 0 ? "up" : metrics.ordersChange < 0 ? "down" : "neutral"}
        icon={<ShoppingCartIcon className="h-6 w-6" />}
        color="bg-blue-100"
        textColor="text-blue-800"
        iconColor="text-blue-500"
      />
      
      <MetricCard 
        title="New Customers" 
        value={metrics.newCustomers.toString()} 
        change={formatChange(metrics.customersChange)} 
        trend={metrics.customersChange > 0 ? "up" : metrics.customersChange < 0 ? "down" : "neutral"}
        icon={<UsersIcon className="h-6 w-6" />}
        color="bg-purple-100"
        textColor="text-purple-800"
        iconColor="text-purple-500"
      />
      
      <MetricCard 
        title="Avg. Delivery Time" 
        value={`${metrics.avgDeliveryTime} min`} 
        change={formatChange(metrics.deliveryTimeChange)} 
        trend={metrics.deliveryTimeChange < 0 ? "up" : metrics.deliveryTimeChange > 0 ? "down" : "neutral"}
        icon={<ClockIcon className="h-6 w-6" />}
        color="bg-amber-100"
        textColor="text-amber-800"
        iconColor="text-amber-500"
      />
    </div>
  );
} 
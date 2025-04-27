'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import AnalyticsFilters from '../../components/admin/analytics/AnalyticsFilters';
import OrderStatistics from '../../components/admin/analytics/OrderStatistics';
import CustomerStats from '../../components/admin/analytics/CustomerStats';
import PopularDishesChart from '../../components/admin/analytics/PopularDishesChart';
import OrderTrendsChart from '../../components/admin/analytics/OrderTrendsChart';
import RegionalOrdersMap from '../../components/admin/analytics/RegionalOrdersMap';

function AnalyticsContent() {
  const searchParams = useSearchParams()
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <AnalyticsFilters />
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Suspense fallback={<div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>}>
          <div className="bg-white p-6 rounded-lg shadow col-span-1">
            <h2 className="text-lg font-medium mb-4">Order Statistics</h2>
            <OrderStatistics />
          </div>
        </Suspense>
        
        <Suspense fallback={<div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>}>
          <div className="bg-white p-6 rounded-lg shadow col-span-1">
            <h2 className="text-lg font-medium mb-4">Customer Stats</h2>
            <CustomerStats />
          </div>
        </Suspense>
        
        <Suspense fallback={<div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>}>
          <div className="bg-white p-6 rounded-lg shadow col-span-1">
            <h2 className="text-lg font-medium mb-4">Popular Dishes</h2>
            <PopularDishesChart />
          </div>
        </Suspense>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<div className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>}>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4">Order Trends</h2>
            <OrderTrendsChart />
          </div>
        </Suspense>
        
        <Suspense fallback={<div className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>}>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4">Regional Orders</h2>
            <RegionalOrdersMap />
          </div>
        </Suspense>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  )
} 
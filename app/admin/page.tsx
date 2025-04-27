import { Suspense } from 'react';
import RevenueChart from '../components/admin/dashboard/RevenueChart';
import OrdersTable from '../components/admin/dashboard/OrdersTable';
import MetricCard from '../components/admin/dashboard/MetricCard';
import BestSellingItems from '../components/admin/dashboard/BestSellingItems';
import { 
  ArrowTrendingUpIcon, 
  ShoppingCartIcon, 
  UsersIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Admin Dashboard | ChayFood',
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>}>
          <MetricCard 
            title="Total Revenue" 
            value="₫8,294,500" 
            change="+12.5%" 
            trend="up"
            icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
            color="bg-green-100"
            textColor="text-green-800"
            iconColor="text-green-500"
          />
        </Suspense>
        
        <Suspense fallback={<div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>}>
          <MetricCard 
            title="Orders Today" 
            value="24" 
            change="+4.3%" 
            trend="up"
            icon={<ShoppingCartIcon className="h-6 w-6" />}
            color="bg-blue-100"
            textColor="text-blue-800"
            iconColor="text-blue-500"
          />
        </Suspense>
        
        <Suspense fallback={<div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>}>
          <MetricCard 
            title="New Customers" 
            value="8" 
            change="+22.5%" 
            trend="up"
            icon={<UsersIcon className="h-6 w-6" />}
            color="bg-purple-100"
            textColor="text-purple-800"
            iconColor="text-purple-500"
          />
        </Suspense>
        
        <Suspense fallback={<div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>}>
          <MetricCard 
            title="Avg. Delivery Time" 
            value="28 min" 
            change="-3.2%" 
            trend="down"
            icon={<ClockIcon className="h-6 w-6" />}
            color="bg-amber-100"
            textColor="text-amber-800"
            iconColor="text-amber-500"
          />
        </Suspense>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Revenue (Last 7 Days)</h2>
          <div className="h-80">
            <Suspense fallback={<div className="h-full bg-gray-200 rounded-lg animate-pulse"></div>}>
              <RevenueChart />
            </Suspense>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Best Selling Items</h2>
          <div className="h-80">
            <Suspense fallback={<div className="h-full bg-gray-200 rounded-lg animate-pulse"></div>}>
              <BestSellingItems />
            </Suspense>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Recent Orders</h2>
        <Suspense fallback={<div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>}>
          <OrdersTable />
        </Suspense>
      </div>
    </div>
  );
} 
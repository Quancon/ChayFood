'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

type Order = {
  id: string;
  customerName: string;
  date: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  items: number;
  paymentMethod: string;
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-indigo-100 text-indigo-800',
  ready: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real implementation, you would fetch data from your API
        // For now, we'll use mock data
        // const response = await axios.get('/api/admin/recent-orders');
        // setOrders(response.data);
        
        // Mock data
        const mockData: Order[] = [
          { 
            id: 'ORD123456', 
            customerName: 'Nguyen Van A', 
            date: '2023-06-15T08:30:00Z', 
            totalAmount: 235000, 
            status: 'delivered',
            items: 3,
            paymentMethod: 'card'
          },
          { 
            id: 'ORD123457', 
            customerName: 'Tran Thi B', 
            date: '2023-06-15T09:15:00Z', 
            totalAmount: 185000, 
            status: 'preparing',
            items: 2,
            paymentMethod: 'cod'
          },
          { 
            id: 'ORD123458', 
            customerName: 'Le Van C', 
            date: '2023-06-15T10:20:00Z', 
            totalAmount: 320000, 
            status: 'confirmed',
            items: 4,
            paymentMethod: 'banking'
          },
          { 
            id: 'ORD123459', 
            customerName: 'Pham Thi D', 
            date: '2023-06-15T11:05:00Z', 
            totalAmount: 145000, 
            status: 'pending',
            items: 2,
            paymentMethod: 'cod'
          },
          { 
            id: 'ORD123460', 
            customerName: 'Hoang Van E', 
            date: '2023-06-15T11:45:00Z', 
            totalAmount: 280000, 
            status: 'cancelled',
            items: 3,
            paymentMethod: 'card'
          },
        ];
        
        setOrders(mockData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recent orders:', err);
        setError('Failed to load recent orders');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-48">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Format number as VND currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Items
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {order.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.customerName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(order.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatCurrency(order.totalAmount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.items}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.paymentMethod}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Link href={`/admin/orders/${order.id}`} className="text-blue-500 hover:text-blue-700 mr-4">
                  View
                </Link>
                <button className="text-gray-500 hover:text-gray-700">
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Showing {orders.length} of {orders.length} orders
        </div>
        <Link href="/admin/orders" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
          View All Orders
        </Link>
      </div>
    </div>
  );
} 
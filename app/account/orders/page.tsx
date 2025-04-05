'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../lib/services';
import Link from 'next/link';

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let color = '';
  
  switch (status) {
    case 'pending':
      color = 'bg-yellow-100 text-yellow-800';
      break;
    case 'processing':
      color = 'bg-blue-100 text-blue-800';
      break;
    case 'out_for_delivery':
      color = 'bg-purple-100 text-purple-800';
      break;
    case 'delivered':
      color = 'bg-green-100 text-green-800';
      break;
    case 'cancelled':
      color = 'bg-red-100 text-red-800';
      break;
    default:
      color = 'bg-gray-100 text-gray-800';
  }
  
  return (
    <span className={`${color} px-3 py-1 rounded-full text-xs font-semibold`}>
      {status.replace('_', ' ')}
    </span>
  );
};

// Helper to format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

interface Order {
  _id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: Array<{
    quantity: number;
    menuItemDetails?: {
      name: string;
    };
  }>;
}

export default function OrdersPage() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [showAuthMessage, setShowAuthMessage] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Only fetch orders if user is authenticated and auth checking is complete
        if (!authLoading && isAuthenticated) {
          setLoading(true);
          const response = await orderService.getMyOrders();
          console.log('My orders response:', response);
          
          if (response && response.status === 'success' && Array.isArray(response.data)) {
            setOrders(response.data);
          } else {
            console.error('Invalid order data structure:', response);
            setError('Failed to load orders. Unexpected data format.');
          }
        } else if (!authLoading && !isAuthenticated) {
          // If auth checking is complete and user is not authenticated
          setShowAuthMessage(true);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, authLoading]);

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') {
      return ['pending', 'processing', 'out_for_delivery'].includes(order.status);
    }
    if (activeTab === 'completed') {
      return ['delivered', 'cancelled'].includes(order.status);
    }
    return true;
  });

  // Show loading state while authentication is being checked
  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  // Show authentication message if user is not authenticated
  if (showAuthMessage) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p className="font-medium">Please sign in to view your orders</p>
          <p className="mt-2">You need to be signed in to view your order history.</p>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-white border border-gray-300 rounded shadow-sm text-gray-700 hover:bg-gray-50"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">My Orders</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'all'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'active'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'completed'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-4">No orders found</h2>
          {activeTab !== 'all' ? (
            <p className="text-gray-600 mb-6">No {activeTab} orders found. Try viewing all orders.</p>
          ) : (
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
          )}
          <button
            onClick={() => router.push('/menu')}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">#{order._id.slice(-6)}</td>
                    <td className="px-6 py-4">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="text-sm">
                          {item.menuItemDetails?.name || 'Item'} × {item.quantity}
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="text-xs text-gray-500 mt-1">
                          +{order.items.length - 2} more items
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">${order.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/order/${order._id}`}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 
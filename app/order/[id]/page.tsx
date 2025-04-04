'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../lib/api';
import Image from 'next/image';

// Type for Order Details
interface OrderDetails {
  _id: string;
  user: string;
  items: Array<OrderItem>;
  totalAmount: number;
  status: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    additionalInfo?: string;
  };
  paymentMethod: 'cod' | 'card' | 'banking';
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper to format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

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

// Interface for order item with menuItemDetails
interface OrderItem {
  menuItem: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
  menuItemDetails?: {
    name: string;
    image?: string;
  };
}

export default function OrderDetailsPage() {
  const { id } = useParams() as { id: string };
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await orderAPI.getById(id);
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, isAuthenticated, router]);

  const handleCancelOrder = async () => {
    if (!order || !id) return;
    
    try {
      setCancelLoading(true);
      await orderAPI.cancel(id);
      setCancelSuccess(true);
      
      // Update the order status in the UI
      setOrder((prev: OrderDetails | null) => prev ? { ...prev, status: 'cancelled' } : null);
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError('Failed to cancel order. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button
            onClick={() => router.push('/account/orders')}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Order not found</p>
          <button
            onClick={() => router.push('/account/orders')}
            className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const canCancel = ['pending', 'processing'].includes(order.status);

  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Order Details</h1>
        <button
          onClick={() => router.push('/account/orders')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to Orders
        </button>
      </div>
      
      {cancelSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          Your order has been successfully cancelled.
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-wrap justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Order #{order._id.slice(-6)}</h2>
                <p className="text-gray-600">{formatDate(order.createdAt)}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Order Items</h3>
              <div className="divide-y">
                {order.items.map((item: OrderItem, index: number) => (
                  <div key={index} className="py-4 flex">
                    {item.menuItemDetails?.image && (
                      <div className="relative h-16 w-16 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={item.menuItemDetails.image || 'https://placekitten.com/500/300'}
                          alt={item.menuItemDetails.name || 'Menu item'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-grow ml-4">
                      <div className="flex justify-between">
                        <h4 className="font-medium">
                          {item.menuItemDetails?.name || 'Unknown Item'} × {item.quantity}
                        </h4>
                        <p className="text-gray-700">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      
                      {item.specialInstructions && (
                        <p className="text-sm text-gray-500 mt-1">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {order.specialInstructions && (
              <div className="border-t pt-6 mt-6">
                <h3 className="font-semibold mb-2">Special Instructions</h3>
                <p className="text-gray-700">{order.specialInstructions}</p>
              </div>
            )}
          </div>
          
          {/* Order timeline - optional for future enhancement */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold mb-4">Order Timeline</h3>
            <div className="space-y-4">
              <div className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="bg-green-500 rounded-full h-3 w-3"></div>
                  <div className="bg-gray-200 h-full w-0.5 flex-grow"></div>
                </div>
                <div>
                  <p className="font-medium">Order Placed</p>
                  <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              
              {order.status !== 'pending' && order.status !== 'cancelled' && (
                <div className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className="bg-green-500 rounded-full h-3 w-3"></div>
                    <div className="bg-gray-200 h-full w-0.5 flex-grow"></div>
                  </div>
                  <div>
                    <p className="font-medium">Order Processing</p>
                    <p className="text-sm text-gray-600">Your order is being prepared</p>
                  </div>
                </div>
              )}
              
              {order.status === 'out_for_delivery' || order.status === 'delivered' ? (
                <div className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className="bg-green-500 rounded-full h-3 w-3"></div>
                    <div className="bg-gray-200 h-full w-0.5 flex-grow"></div>
                  </div>
                  <div>
                    <p className="font-medium">Out for Delivery</p>
                    <p className="text-sm text-gray-600">Your order is on the way</p>
                  </div>
                </div>
              ) : null}
              
              {order.status === 'delivered' ? (
                <div className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className="bg-green-500 rounded-full h-3 w-3"></div>
                  </div>
                  <div>
                    <p className="font-medium">Delivered</p>
                    <p className="text-sm text-gray-600">Enjoy your meal!</p>
                  </div>
                </div>
              ) : null}
              
              {order.status === 'cancelled' && (
                <div className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className="bg-red-500 rounded-full h-3 w-3"></div>
                  </div>
                  <div>
                    <p className="font-medium">Cancelled</p>
                    <p className="text-sm text-gray-600">This order has been cancelled</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Order details sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-24">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="border-b pb-4 mb-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Delivery Fee</span>
                <span>$3.99</span>
              </div>
              <div className="flex justify-between font-semibold mt-2">
                <span>Total</span>
                <span>${(order.totalAmount + 3.99).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Delivery Address</h3>
              <address className="not-italic text-gray-700">
                {order.deliveryAddress.street}<br />
                {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.postalCode}
                {order.deliveryAddress.additionalInfo && (
                  <>
                    <br />
                    <span className="text-gray-600 text-sm mt-1">
                      {order.deliveryAddress.additionalInfo}
                    </span>
                  </>
                )}
              </address>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Payment Method</h3>
              <p className="text-gray-700 capitalize">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                 order.paymentMethod === 'card' ? 'Credit Card' : 
                 order.paymentMethod === 'banking' ? 'Online Banking' : 
                 order.paymentMethod}
              </p>
            </div>
            
            {canCancel && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelLoading}
                className={`w-full py-2 mt-4 rounded text-white font-medium ${
                  cancelLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {cancelLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full" />
                    Cancelling...
                  </span>
                ) : (
                  'Cancel Order'
                )}
              </button>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold mb-4">Need Help?</h3>
            <p className="text-gray-700 mb-4">
              If you have any questions or concerns about your order, please contact our customer service team.
            </p>
            <div className="space-y-2">
              <a href="tel:+1234567890" className="text-green-600 hover:text-green-800 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                (123) 456-7890
              </a>
              <a href="mailto:support@chayfood.com" className="text-green-600 hover:text-green-800 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                support@chayfood.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
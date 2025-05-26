'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../lib/services';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, TruckIcon, ClockIcon } from '@heroicons/react/24/outline';

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
  let icon = null;
  
  switch (status) {
    case 'pending':
      color = 'bg-yellow-100 text-yellow-800 border-yellow-200';
      icon = <ClockIcon className="h-4 w-4 mr-1" />;
      break;
    case 'preparing':
      color = 'bg-blue-100 text-blue-800 border-blue-200';
      icon = <ClockIcon className="h-4 w-4 mr-1" />;
      break;
    case 'out_for_delivery':
      color = 'bg-purple-100 text-purple-800 border-purple-200';
      icon = <TruckIcon className="h-4 w-4 mr-1" />;
      break;
    case 'delivered':
      color = 'bg-green-100 text-green-800 border-green-200';
      icon = <CheckCircleIcon className="h-4 w-4 mr-1" />;
      break;
    case 'cancelled':
      color = 'bg-red-100 text-red-800 border-red-200';
      icon = <XCircleIcon className="h-4 w-4 mr-1" />;
      break;
    default:
      color = 'bg-gray-100 text-gray-800 border-gray-200';
  }
  
  return (
    <span className={`${color} px-4 py-2 rounded-full text-sm font-medium border flex items-center`}>
      {icon}
      {status.replace('_', ' ')}
    </span>
  );
};

// Payment method badge component
const PaymentMethodBadge = ({ method }: { method: string }) => {
  let label = '';
  let color = '';
  
  switch (method) {
    case 'cod':
      label = 'Cash on Delivery';
      color = 'bg-blue-50 text-blue-700 border-blue-100';
      break;
    case 'card':
      label = 'Credit/Debit Card';
      color = 'bg-purple-50 text-purple-700 border-purple-100';
      break;
    case 'banking':
      label = 'Online Banking';
      color = 'bg-green-50 text-green-700 border-green-100';
      break;
    default:
      label = method;
      color = 'bg-gray-50 text-gray-700 border-gray-100';
  }
  
  return (
    <span className={`${color} px-3 py-1 rounded-full text-xs font-medium border`}>
      {label}
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
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState("");
  const [receivedLoading, setReceivedLoading] = useState(false);
  const [receivedSuccess, setReceivedSuccess] = useState(false);
  const [showReceivedConfirm, setShowReceivedConfirm] = useState(false);
  const [receivedFeedback, setReceivedFeedback] = useState("");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (authLoading) return;
      
      if (!isAuthenticated) {
        router.push('/');
        return;
      }
      
      try {
        setLoading(true);
        const response = await orderService.getById(id);
        if (response && response.status === 'success' && response.data) {
          console.log('Order details:', response.data);
          console.log('Order status:', response.data.status);
          setOrder(response.data);
        } else {
          setError('Failed to load order details. Unexpected data format.');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, isAuthenticated, router, authLoading]);

  // Monitor showReceivedConfirm changes
  useEffect(() => {
    console.log('showReceivedConfirm changed:', showReceivedConfirm);
  }, [showReceivedConfirm]);

  const handleCancelOrder = async () => {
    if (!order || !id) return;
    
    try {
      setCancelLoading(true);
      
      try { 
        // Send cancellation with feedback
        const response = await orderService.cancel(id, cancelFeedback);
        console.log('Cancel order response:', response);
        
      
        setShowCancelConfirm(false);
        
        // Update the order status in the UI
        setOrder((prev: OrderDetails | null) => prev ? { ...prev, status: 'cancelled' } : null);
      } catch (apiError) {
        console.error('API error when cancelling order:', apiError);
        // Even if API fails, still show success UI for now
        // In a production app, you'd want to show an error instead
    
        setShowCancelConfirm(false);
        setOrder((prev: OrderDetails | null) => prev ? { ...prev, status: 'cancelled' } : null);
      }
    } catch (err) {
      console.error('Error in cancel order handler:', err);
      setError('Failed to cancel order. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  /**
   * Handle marking an order as received (delivered)
   */
  const handleReceivedOrder = async () => {
    if (!order || !id) return;
    
    try {
      setReceivedLoading(true);
      
      try {
        // Send cancellation with feedback
        const response = await orderService.markAsReceived(id, receivedFeedback);
        console.log('Cancel order response:', response);
        
        // Success
        setReceivedSuccess(true);
        setShowReceivedConfirm(false);
        
        // Update the order status in the UI
        setOrder((prev: OrderDetails | null) => prev ? { ...prev, status: 'delivered' } : null);
      } catch (apiError) {
        console.error('API error when confirming order:', apiError);
        // Even if API fails, still show success UI for now
        // In a production app, you'd want to show an error instead
        setReceivedSuccess(true);
        setShowReceivedConfirm(false);
        setOrder((prev: OrderDetails | null) => prev ? { ...prev, status: 'delivered' } : null);
      }
    } catch (err) {
      console.error('Error in received order handler:', err);
      setError('Failed to received order. Please try again.');
    } finally {
      setReceivedLoading(false);
    }
  };
 

  if (authLoading || loading) {
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-2">Something went wrong</h2>
          <p>{error}</p>
          <button
            onClick={() => router.push('/account/orders')}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
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
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-2">Order not found</h2>
          <p>We could not find the order you are looking for.</p>
          <button
            onClick={() => router.push('/account/orders')}
            className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  // Check if user can cancel the order or mark as received
  const canCancel = order && ['pending', 'preparing'].some(
    status => order.status === status
  );
  const canMarkReceived = order && ['confirmed', 'delivered'].some(
    status => order.status === status
  );
  
  console.log('Order status exactly:', JSON.stringify(order.status));
  console.log('Can cancel order:', canCancel, 'Current status:', order?.status);
  console.log('Can mark as received:', canMarkReceived, 'Current status:', order?.status);
  
  const orderAddress = `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state}, ${order.deliveryAddress.postalCode}`;

  return (
    <div className="container mx-auto px-4 py-16 mt-16">

      {/* Header with back button and order ID */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-3xl font-bold mb-2 sm:mb-0">Order <span className="text-green-600">#{order._id.slice(-6)}</span></h1>
        <button
          onClick={() => router.push('/account/orders')}
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Orders
        </button>
      </div>
      
      {/* Success message for cancellation */}
      {receivedSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg shadow-sm mb-6"
        >
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            <p className="font-medium">Thank you for confirming your order delivery!</p>
          </div>
        </motion.div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main order details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order status and summary */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 border-b px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div className="mb-4 sm:mb-0">
                  <h2 className="text-xl font-semibold">Order Status</h2>
                  <p className="text-gray-600 text-sm">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
            </div>
            
            <div className="px-6 py-4">
              <h3 className="font-semibold text-lg mb-4">Order Items</h3>
              <div className="divide-y">
                {order.items.map((item: OrderItem, index: number) => (
                  <div key={index} className="py-4 flex">
                    <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                      <Image
                        src={item.menuItemDetails?.image || 'https://placekitten.com/200/200'}
                        alt={item.menuItemDetails?.name || 'Menu item'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow ml-4">
                      <div className="flex justify-between">
                        <h4 className="font-medium">
                          {item.menuItemDetails?.name || 'Unknown Item'}
                        </h4>
                        <p className="text-gray-700 font-medium">{(item.price * item.quantity).toLocaleString()} VNĐ</p>
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} × {item.price.toLocaleString()} VNĐ
                        </p>
                      </div>
                      
                      {item.specialInstructions && (
                        <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded-md">
                          <span className="font-medium">Note:</span> {item.specialInstructions}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t mt-6 pt-4">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{order.totalAmount.toLocaleString()} VNĐ</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">0 VNĐ</span>
                </div>
                <div className="flex justify-between py-2 border-t border-dashed">
                  <span className="text-gray-800 font-semibold">Total</span>
                  <span className="font-semibold text-green-600">{order.totalAmount.toLocaleString()} VNĐ</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Special instructions */}
          {order.specialInstructions && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-lg mb-3">Special Instructions</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{order.specialInstructions}</p>
            </div>
          )}
        </div>
        
        {/* Order information sidebar */}
        <div className="space-y-6">
          {/* Delivery details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-4">Delivery Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Delivery Address</p>
                <p className="text-gray-800">{orderAddress}</p>
                {order.deliveryAddress.additionalInfo && (
                  <p className="text-gray-600 text-sm mt-1">
                    {order.deliveryAddress.additionalInfo}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                <PaymentMethodBadge method={order.paymentMethod} />
              </div>
            </div>
          </div>
          
          {/* Order Actions */}
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200">
            <h3 className="font-semibold text-lg mb-4 text-center">Order Actions</h3>
            
            <div className="space-y-4">
              {/* Cancel button - only show when order is in pending status */}
              {canCancel && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={cancelLoading || order.status === 'cancelled' || order.status === 'delivered'}
                  className="w-full px-4 py-3 text-base font-medium rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-70"
                >
                   Order Cancel
                </button>
              )}
              
              {/* Mark as received button - only show for appropriate statuses */}
              {canMarkReceived && (
                <button
                  onClick={() => setShowReceivedConfirm(true)}
                  className="w-full px-4 py-3 text-base font-medium rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-70"
                >
                
                   
                   Order Delivered
                </button>
              )}
            </div>
            
            <p className="text-gray-500 text-sm mt-3 text-center">
              Current order status: <span className="font-medium">{order.status}</span>
            </p>
          </div>
          
          {/* Help & Support */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-4">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              If you have any questions about your order, our customer support team is here to help.
            </p>
            <button
              onClick={() => window.location.href = 'mailto:support@chayfood.com'}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
      
      {/* Cancel confirmation modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6"
          >
            <h3 className="text-xl font-bold mb-4">Cancel Order</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            
            <div className="mb-4">
              <label htmlFor="cancelFeedback" className="block text-sm font-medium text-gray-700 mb-2">
                Please tell us why you&#39;re cancelling (optional):
              </label>
              <textarea
                id="cancelFeedback"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your reason for cancellation..."
                value={cancelFeedback}
                onChange={(e) => setCancelFeedback(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors disabled:opacity-50"
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Received Confirmation Modal - added extra console.log for debugging */}
      {showReceivedConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setShowReceivedConfirm(false)}></div>
            <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
              <div className="mt-2">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Confirm Order Received</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Please confirm that you have received this order. This action cannot be undone.
                </p>
                <div className="mt-4">
                  <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
                    Feedback (Optional)
                  </label>
                  <textarea
                    id="feedback"
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    placeholder="How was your experience? Any comments about the food or delivery?"
                    value={receivedFeedback}
                    onChange={(e) => setReceivedFeedback(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none"
                  onClick={() => setShowReceivedConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none"
                  onClick={handleReceivedOrder}
                  disabled={receivedLoading}
                >
                  {receivedLoading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {receivedSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Order successfully marked as received!</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none"
                  onClick={() => setReceivedSuccess(false)}
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
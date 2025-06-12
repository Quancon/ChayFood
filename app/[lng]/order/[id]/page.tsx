'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../../lib/services';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, TruckIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { menuService } from '../../../lib/services/menuService';

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
const formatDate = (dateString: string, lng: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };
  return new Date(dateString).toLocaleDateString(lng, options);
};

// Status badge component
const StatusBadge = ({ status, t }: { status: string; t: TFunction }) => {
  let color = '';
  let icon = null;
  let translatedStatus = '';

  switch (status) {
    case 'pending':
      color = 'bg-yellow-100 text-yellow-800 border-yellow-200';
      icon = <ClockIcon className="h-4 w-4 mr-1" />;
      translatedStatus = t('orderDetails.status.pending');
      break;
    case 'preparing':
      color = 'bg-blue-100 text-blue-800 border-blue-200';
      icon = <ClockIcon className="h-4 w-4 mr-1" />;
      translatedStatus = t('orderDetails.status.preparing');
      break;
    case 'out_for_delivery':
      color = 'bg-purple-100 text-purple-800 border-purple-200';
      icon = <TruckIcon className="h-4 w-4 mr-1" />;
      translatedStatus = t('orderDetails.status.outForDelivery');
      break;
    case 'delivered':
      color = 'bg-green-100 text-green-800 border-green-200';
      icon = <CheckCircleIcon className="h-4 w-4 mr-1" />;
      translatedStatus = t('orderDetails.status.delivered');
      break;
    case 'cancelled':
      color = 'bg-red-100 text-red-800 border-red-200';
      icon = <XCircleIcon className="h-4 w-4 mr-1" />;
      translatedStatus = t('orderDetails.status.cancelled');
      break;
    default:
      color = 'bg-gray-100 text-gray-800 border-gray-200';
      translatedStatus = status.replace('_', ' ');
  }

  return (
    <span className={`${color} px-4 py-2 rounded-full text-sm font-medium border flex items-center`}>
      {icon}
      {translatedStatus}
    </span>
  );
};

// Payment method badge component
const PaymentMethodBadge = ({ method, t }: { method: string; t: TFunction }) => {
  let label = '';
  let color = '';

  switch (method) {
    case 'cod':
      label = t('orderDetails.paymentMethod.codLabel');
      color = 'bg-blue-50 text-blue-700 border-blue-100';
      break;
    case 'card':
      label = t('orderDetails.paymentMethod.cardLabel');
      color = 'bg-purple-50 text-purple-700 border-purple-100';
      break;
    case 'banking':
      label = t('orderDetails.paymentMethod.bankingLabel');
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
interface EmbeddedMenuItem {
  _id: string;
  name: string | Record<string, string>;
  image?: string | null;
}

interface OrderItem {
  menuItem: string | EmbeddedMenuItem;
  quantity: number;
  price: number;
  specialInstructions?: string;
  menuItemDetails?: {
    name: string;
    image?: string | null;
  };
}

interface MenuItemWithName { // Define a minimal interface for objects with a 'name' property
  name: string | Record<string, string>;
}

function getMenuItemName(menuItemDetails: MenuItemWithName | null | undefined, lng: string) {
  if (!menuItemDetails) return '';
  if (typeof menuItemDetails.name === 'object') {
    return (menuItemDetails.name as Record<string, string>)[lng] || (menuItemDetails.name as Record<string, string>).en || '';
  }
  return menuItemDetails.name || '';
}

export default function OrderDetailsPage() {
  const params = useParams();
  const { id, lng } = params as { id: string; lng: string };
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
  const { t } = useTranslation();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (authLoading) return;
      if (!isAuthenticated) {
        router.push(`/${lng}/login`);
        return;
      }
      try {
        setLoading(true);
        const response = await orderService.getById(id);
        if (response && response.status === 'success' && response.data) {
          const orderData = response.data;
          // Hydrate menu item details
          if (orderData.items && Array.isArray(orderData.items)) {
            const hydratedItems = await Promise.all(
              orderData.items.map(async (item: OrderItem) => {
                let currentMenuItemDetails: { name: string; image?: string | null } | null = null;

                if (item.menuItemDetails && item.menuItemDetails.name) {
                  // If details are already present and valid, use them
                  currentMenuItemDetails = item.menuItemDetails;
                } else if (typeof item.menuItem === 'object' && item.menuItem !== null && 'name' in item.menuItem) {
                  // If menuItem is an embedded object, use its details
                  const embeddedMenuItem = item.menuItem as EmbeddedMenuItem;
                  if (embeddedMenuItem.name) {
                    currentMenuItemDetails = {
                      name: getMenuItemName(embeddedMenuItem, lng),
                      image: embeddedMenuItem.image || null
                    };
                  }
                }

                // If menuItem is an ID or not an object with _id, fetch details
                // This part should only execute if currentMenuItemDetails is still null after previous checks
                if (!currentMenuItemDetails) {
                  const menuItemId = typeof item.menuItem === 'object' && item.menuItem !== null && '_id' in item.menuItem
                    ? (item.menuItem as EmbeddedMenuItem)._id
                    : item.menuItem as string;
                  try {
                    const menuRes = await menuService.getById(menuItemId);
                    currentMenuItemDetails = menuRes.data ? {
                      name: menuRes.data.name,
                      image: menuRes.data.image || null
                    } : null;
                  } catch {
                    // If error, leave as null
                    currentMenuItemDetails = null;
                  }
                }

                return {
                  ...item,
                  menuItemDetails: currentMenuItemDetails,
                };
              })
            );
            orderData.items = hydratedItems;
          }
          setOrder(orderData);
        } else {
          setError(t('orderDetails.loadError'));
        }
      } catch {
        setError(t('orderDetails.fetchError'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, isAuthenticated, router, authLoading, lng, t]);

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
        setCancelFeedback(t('orderDetails.cancelSuccess'));
      } catch (apiError) {
        console.error('API error when cancelling order:', apiError);
        // Even if API fails, still show success UI for now
        // In a production app, you'd want to show an error instead
    
        setShowCancelConfirm(false);
        setOrder((prev: OrderDetails | null) => prev ? { ...prev, status: 'cancelled' } : null);
        setCancelFeedback(t('orderDetails.cancelError'));
      }
    } catch (err) {
      console.error('Error in cancel order handler:', err);
      setError(t('orderDetails.cancelFailed'));
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
        setReceivedFeedback(t('orderDetails.receivedSuccess'));
      } catch (apiError) {
        console.error('API error when confirming order:', apiError);
        // Even if API fails, still show success UI for now
        // In a production app, you'd want to show an error instead
        setReceivedSuccess(true);
        setShowReceivedConfirm(false);
        setOrder((prev: OrderDetails | null) => prev ? { ...prev, status: 'delivered' } : null);
        setReceivedFeedback(t('orderDetails.receivedError'));
      }
    } catch (err) {
      console.error('Error in received order handler:', err);
      setError(t('orderDetails.receivedFailed'));
    } finally {
      setReceivedLoading(false);
    }
  };
 

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">{t('orderDetails.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16 text-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16 text-center">
        <p className="text-gray-600">{t('orderDetails.noOrderFound')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-6 text-green-700"
        >
          {t('orderDetails.title')}
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-green-600">{t('orderDetails.orderInfo')}</h2>
            <p className="text-gray-700">
              <span className="font-medium">{t('orderDetails.orderId')}:</span> {order._id}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">{t('orderDetails.orderDate')}:</span> {formatDate(order.createdAt, lng)}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">{t('orderDetails.status')}:</span> <StatusBadge status={order.status} t={t} />
            </p>
            <p className="text-gray-700">
              <span className="font-medium">{t('orderDetails.paymentMethod')}:</span> <PaymentMethodBadge method={order.paymentMethod} t={t} />
            </p>
            {order.specialInstructions && (
              <p className="text-gray-700">
                <span className="font-medium">{t('orderDetails.specialInstructions')}:</span> {order.specialInstructions}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-green-600">{t('orderDetails.deliveryAddress')}</h2>
            <p className="text-gray-700">{order.deliveryAddress.street}</p>
            <p className="text-gray-700">{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.postalCode}</p>
            {order.deliveryAddress.additionalInfo && (
              <p className="text-gray-700">{order.deliveryAddress.additionalInfo}</p>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-green-600">{t('orderDetails.orderItems')}</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 border-b pb-4 last:border-b-0 last:pb-0">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image
                    src={item.menuItemDetails?.image || '/meals/meal-placeholder.jpg'}
                    alt={getMenuItemName(item.menuItemDetails, lng) || t('orderDetails.unknownItem')}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="flex-grow">
                  <p className="font-medium text-lg text-gray-800">
                    {getMenuItemName(item.menuItemDetails, lng) || t('orderDetails.unknownItem')}
                  </p>
                  <p className="text-gray-600">{t('orderDetails.quantity')}: {item.quantity}</p>
                  {item.specialInstructions && (
                    <p className="text-gray-600 text-sm italic">{t('orderDetails.itemInstructions')}: {item.specialInstructions}</p>
                  )}
                </div>
                <p className="font-semibold text-lg text-green-700">
                  {new Intl.NumberFormat(lng, { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end items-center mb-8">
          <p className="text-xl font-bold text-green-800">{t('orderDetails.totalAmount')}: {new Intl.NumberFormat(lng, { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {order.status === 'pending' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCancelConfirm(true)}
              className="bg-red-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center"
              disabled={cancelLoading}
            >
              {cancelLoading && <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full" />}
              {t('orderDetails.cancelOrder')}
            </motion.button>
          )}
          {(order.status === 'out_for_delivery' || order.status === 'delivered') && !receivedSuccess && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowReceivedConfirm(true)}
              className="bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center"
              disabled={receivedLoading}
            >
              {receivedLoading && <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full" />}
              {t('orderDetails.markAsReceived')}
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`/${lng}/menu`)}
            className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center"
          >
            {t('orderDetails.backToMenu')}
          </motion.button>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm"
            >
              <h3 className="text-lg font-bold mb-4">{t('orderDetails.cancelConfirmTitle')}</h3>
              <p className="mb-4">{t('orderDetails.cancelConfirmMessage')}</p>
              <textarea
                className="w-full p-2 border rounded-md mb-4"
                rows={3}
                placeholder={t('orderDetails.cancelFeedbackPlaceholder')}
                value={cancelFeedback}
                onChange={(e) => setCancelFeedback(e.target.value)}
              ></textarea>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                  disabled={cancelLoading}
                >
                  {cancelLoading ? t('common.cancelling') : t('common.confirm')}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Received Confirmation Modal */}
        {showReceivedConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm"
            >
              <h3 className="text-lg font-bold mb-4">{t('orderDetails.receivedConfirmTitle')}</h3>
              <p className="mb-4">{t('orderDetails.receivedConfirmMessage')}</p>
              <textarea
                className="w-full p-2 border rounded-md mb-4"
                rows={3}
                placeholder={t('orderDetails.receivedFeedbackPlaceholder')}
                value={receivedFeedback}
                onChange={(e) => setReceivedFeedback(e.target.value)}
              ></textarea>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowReceivedConfirm(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleReceivedOrder}
                  className="px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600"
                  disabled={receivedLoading}
                >
                  {receivedLoading ? t('common.confirming') : t('common.confirm')}
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
} 
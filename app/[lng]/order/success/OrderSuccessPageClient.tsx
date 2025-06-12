'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Home, ShoppingBag } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Loader2 } from 'lucide-react';
import { orderService } from '../../../lib/services/orderService';
import { Order as BackendOrderType, MenuItem as BackendMenuItem } from '../../../lib/services/types';
import { useCart } from '../../hooks/useCart';
import CartToast from '../../../components/cart-toast';
import { useTranslation } from 'react-i18next';

function getMenuItemName(menuItem: string | BackendMenuItem, lng: string) {
  if (typeof menuItem === 'string') {
    return menuItem; // If it's just the ID, return it as a fallback for display
  }
  // Now menuItem is BackendMenuItem or a similar object
  if (!menuItem) return '';
  if (typeof menuItem.name === 'object') {
    return (menuItem.name as Record<string, string>)[lng] || (menuItem.name as Record<string, string>).en || '';
  }
  return menuItem.name || '';
}

export default function OrderSuccessPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const { lng } = params as { lng: string };
  const orderId = searchParams.get('orderId');
  const sessionId = searchParams.get('session_id');
  const { t } = useTranslation();

  const [order, setOrder] = useState<BackendOrderType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { clearCart, message, hasMessage, dismissMessage } = useCart();
  const clearedRef = useRef(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId && !sessionId) {
        setIsLoading(false);
        return;
      }

      try {
        let data = null;
        if (sessionId) {
          console.log('Fetching order by session ID:', sessionId);
          data = await orderService.getBySessionId(sessionId);
        } else if (orderId) {
          console.log('Fetching order by order ID:', orderId);
          data = await orderService.getById(orderId);
        }
        if (data) {
          setOrder(data as BackendOrderType);
          if (!clearedRef.current) {
            await clearCart();
            clearedRef.current = true;
          }
        } else {
          throw new Error(t('orderSuccess.loadError'));
        }
      } catch (error: unknown) {
        console.error('Error fetching order:', error);
        setError(error instanceof Error ? error.message : t('orderSuccess.fetchError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, sessionId, clearCart, t]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
        <p className="text-gray-600">{t('orderSuccess.loadingOrderInfo')}</p>
      </div>
    );
  }

  if (!orderId && !sessionId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('orderSuccess.noOrderFoundTitle')}</h1>
          <p className="text-gray-600 mb-6">{t('orderSuccess.noOrderIdOrSessionId')}</p>
          <Button onClick={() => router.push('/')} className="bg-green-600 hover:bg-green-700">
            {t('common.backToHome')}
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('orderSuccess.errorTitle')}</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/')} className="bg-green-600 hover:bg-green-700">
            {t('common.backToHome')}
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('orderSuccess.noOrderInfoTitle')}</h1>
          <p className="text-gray-600 mb-6">{t('orderSuccess.orderProcessing')}</p>
          <Button onClick={() => router.push('/')} className="bg-green-600 hover:bg-green-700">
            {t('common.backToHome')}
          </Button>
        </div>
      </div>
    );
  }

  // Store the order ID for links
  const displayOrderId = order._id;

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t('orderSuccess.title')}</h1>
          <p className="text-gray-600">
            {t('orderSuccess.message')}
          </p>
        </div>
        
        {order && (
          <div className="mb-8">
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h2 className="text-lg font-semibold mb-2">{t('orderSuccess.orderDetails')}</h2>
              <p className="text-gray-600 mb-1">{t('orderSuccess.orderId')}: <span className="font-medium">{order._id}</span></p>
              <p className="text-gray-600 mb-1">{t('orderSuccess.status')}: <span className="font-medium text-green-600">{order.status === 'confirmed' ? t('orderSuccess.statusConfirmed') : t('orderSuccess.statusProcessing')}</span></p>
              <p className="text-gray-600 mb-1">{t('orderSuccess.payment')}: <span className="font-medium text-green-600">{order.paymentStatus === 'paid' ? t('orderSuccess.paymentPaid') : t('orderSuccess.paymentPending')}</span></p>
              <p className="text-gray-600">{t('orderSuccess.total')}: <span className="font-medium">{new Intl.NumberFormat(lng, { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</span></p>
            </div>
            
            <div className="border-t border-b py-4 space-y-2 mb-4">
              <h3 className="text-md font-semibold mb-2">{t('orderSuccess.orderedItems')}</h3>
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.quantity}x {getMenuItemName(item.menuItem, lng) || t('orderSuccess.product')}</span>
                  <span>{new Intl.NumberFormat(lng, { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-md font-semibold mb-2">{t('orderSuccess.deliveryAddress')}</h3>
              <p className="text-gray-600">
                {`${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state}, ${order.deliveryAddress.postalCode}`}
                {order.deliveryAddress.additionalInfo && ` (${order.deliveryAddress.additionalInfo})`}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href={`/${lng}/order/${displayOrderId}`} passHref>
            <Button variant="outline" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              {t('orderSuccess.viewOrderDetails')}
            </Button>
          </Link>
          <Link href={`/${lng}/menu`} passHref>
            <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
              <Home className="h-4 w-4" />
              {t('orderSuccess.continueShopping')}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
      {/* Cart clear notification */}
      {hasMessage && message && (
        <CartToast message={message} isError={false} onDismiss={dismissMessage} duration={4000} />
      )}
    </div>
  );
} 
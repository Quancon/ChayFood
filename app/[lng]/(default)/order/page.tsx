'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCart } from '../hooks/useCart';
import { useAuth } from '@/[lng]/(default)/context/AuthContext';
import { orderService } from '@/lib/services/orderService';
import { CreateOrderDto } from '@/lib/services/types';
import { CartItem } from '@/lib/actions/cartActions';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

// Helper lấy đúng trường string cho name/description
const getMenuItemName = (menuItem: CartItem['menuItem'], lng: string, fallback = '') => {
  if (!menuItem) return fallback;

  let nameToProcess: string | Record<string, string> | undefined;

  if (typeof menuItem === 'object' && 'name' in menuItem) {
    nameToProcess = menuItem.name;
  } else if (typeof menuItem === 'string') {
    // If it's just an ID, return it directly for now or fetch it if needed.
    return menuItem; // Return the ID as a fallback for display
  }

  if (nameToProcess) {
    if (typeof nameToProcess === 'object') {
      return nameToProcess[lng] || nameToProcess.en || fallback;
    } else {
      return nameToProcess;
    }
  }
  return fallback;
};
export default function OrderPage() {
  const params = useParams();
  const { lng } = params as { lng: string };
  const { t } = useTranslation();
  const { items, totalAmount, clearCart, isCartEmpty } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orderCreated, setOrderCreated] = useState<{ orderId: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    additionalInfo: '',
    paymentMethod: 'cod' as 'cod' | 'card' | 'banking',
    specialInstructions: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      // router.push('/login?redirect=order');
      return;
    }

    if (isCartEmpty) {
      router.push(`/${lng}/cart`);
      return;
    }
  }, [isAuthenticated, isCartEmpty, router, lng]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create order payload
      const orderData: CreateOrderDto = {
        items: items.map(item => ({
          menuItem: typeof item.menuItem === 'object' ? item.menuItem._id : item.menuItem,
          quantity: item.quantity,
          price: typeof item.menuItem === 'object' ? item.menuItem.price : 0,
          specialInstructions: item.specialInstructions
        })),
        totalAmount,
        deliveryAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          additionalInfo: formData.additionalInfo || undefined
        },
        paymentMethod: formData.paymentMethod,
        specialInstructions: formData.specialInstructions || undefined
      };

      // Submit order
      const response = await orderService.create(orderData);
      setOrderCreated({ orderId: response.data._id });
      setSuccess(true);
      clearCart();
    } catch (err) {
      console.error('Error creating order:', err);
      setError(t('orderPage.createOrderError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success && orderCreated) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col items-center text-center">
            <div className="bg-green-100 rounded-full p-4 mb-4">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">{t('orderPage.successTitle')}</h1>
            <p className="text-gray-600 mb-6">
              {t('orderPage.successMessage')}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 w-full mb-6">
              <p className="text-sm text-gray-600">{t('orderPage.orderId')}: <span className="font-medium">{orderCreated.orderId}</span></p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={() => router.push(`/${lng}/order/${orderCreated.orderId}`)}
                className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                {t('orderPage.viewDetails')}
              </button>
              <button
                onClick={() => router.push(`/${lng}/menu`)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                {t('orderPage.continueShopping')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-8">{t('orderPage.completeOrderTitle')}</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {t('common.error')}: {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">{t('orderPage.deliveryAddressTitle')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('orderPage.streetAddress')} *
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('orderPage.city')} *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('orderPage.state')} *
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('orderPage.postalCode')} *
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('orderPage.additionalInfo')}
                  </label>
                  <textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">{t('orderPage.paymentMethodTitle')}</h2>
              <div className="space-y-4">
                <div>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="form-radio h-4 w-4 text-green-600"
                    />
                    <span className="ml-2 text-gray-700">{t('orderPage.paymentMethodCOD')}</span>
                  </label>
                </div>
                <div>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="form-radio h-4 w-4 text-green-600"
                    />
                    <span className="ml-2 text-gray-700">{t('orderPage.paymentMethodCard')}</span>
                  </label>
                </div>
                <div>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="banking"
                      checked={formData.paymentMethod === 'banking'}
                      onChange={handleInputChange}
                      className="form-radio h-4 w-4 text-green-600"
                    />
                    <span className="ml-2 text-gray-700">{t('orderPage.paymentMethodBanking')}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">{t('orderPage.specialInstructionsTitle')}</h2>
              <textarea
                id="specialInstructions"
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleInputChange}
                rows={3}
                placeholder={t('orderPage.specialInstructionsPlaceholder')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isCartEmpty}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('orderPage.submittingOrder') : t('orderPage.placeOrder')}
            </button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{t('orderPage.orderSummaryTitle')}</h2>
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={typeof item.menuItem === 'object' ? item.menuItem._id : item.menuItem} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden">
                      <Image
                        src={typeof item.menuItem === 'object' ? item.menuItem.image || '/assets/placeholder.jpg' : '/assets/placeholder.jpg'}
                        alt={getMenuItemName(item.menuItem, lng)}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{getMenuItemName(item.menuItem, lng)}</p>
                      <p className="text-sm text-gray-600">{item.quantity} x {(typeof item.menuItem === 'object' ? item.menuItem.price : 0).toLocaleString('vi-VN')} VND</p>
                      {item.specialInstructions && (
                        <p className="text-xs text-gray-500 italic">{item.specialInstructions}</p>
                      )}
                    </div>
                  </div>
                  <p className="font-semibold">{(item.quantity * (typeof item.menuItem === 'object' ? item.menuItem.price : 0)).toLocaleString('vi-VN')} VND</p>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 flex justify-between items-center">
              <p className="text-lg font-semibold">{t('orderPage.total')}:</p>
              <p className="text-xl font-bold text-green-600">{totalAmount.toLocaleString('vi-VN')} VND</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/[lng]/hooks/useCart';
import { useAuth } from '@/[lng]/context/AuthContext';
import { Loader2, CreditCard, MapPin, Truck, ShoppingBag, User, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { userService } from '@/lib/services/userService';
import { orderService } from '@/[lng]/services/orderService';
import { paymentService } from '@/[lng]/services/paymentService';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

interface Address {
  _id: string;
  name?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  additionalInfo?: string;
  isDefault?: boolean;
}

interface CheckoutPageClientProps {
  lng: string;
}

// Helper lấy đúng trường string cho name/description
const getMenuItemName = (menuItem: any, lng: string, fallback = '') => {
  if (menuItem && typeof menuItem.name === 'object' && menuItem.name !== null) {
    return menuItem.name[lng] || menuItem.name.en || fallback;
  }
  return menuItem?.name || fallback;
};
const getMenuItemDescription = (menuItem: any, lng: string, fallback = '') => {
  if (menuItem && typeof menuItem.description === 'object' && menuItem.description !== null) {
    return menuItem.description[lng] || menuItem.description.en || fallback;
  }
  return menuItem?.description || fallback;
};

export default function CheckoutPageClient({ lng }: CheckoutPageClientProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { items, totalAmount, isCartEmpty, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'banking' | 'stripe'>('banking');
  const [notes, setNotes] = useState<string>('');
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  
  // Fetch user's addresses
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${lng}/auth`);
      return;
    }

    if (isCartEmpty) {
      router.push(`/${lng}/cart`);
      return;
    }

    const fetchAddresses = async () => {
      setIsLoadingAddresses(true);
      try {
        let addressesData: Address[] = [];
        try {
          const res = await userService.getAddresses();
          if (res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
            addressesData = res.data;
          }
        } catch {
          // ignore, fallback below
        }
        if (!addressesData.length) {
          try {
            const res = await userService.getProfile();
            if (res.status === 'success' && res.data && Array.isArray(res.data.addresses)) {
              addressesData = res.data.addresses;
            }
          } catch {
            addressesData = [];
          }
        }
        setAddresses(addressesData);
        const defaultAddress = addressesData.find((addr: Address) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress._id);
        } else if (addressesData.length > 0) {
          setSelectedAddress(addressesData[0]._id);
        }
      } catch {
        setAddresses([]);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [isAuthenticated, isCartEmpty, router, lng]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedAddress) {
      setError(t('checkoutPage.invalidAddress'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get the selected address details
      const address = addresses.find(addr => addr._id === selectedAddress);
      if (!address) {
        throw new Error(t('checkoutPage.invalidAddress'));
      }

      // Format items for order creation
      const orderItems = items.map(item => ({
        menuItem: item.menuItem._id,
        quantity: item.quantity,
        price: item.menuItem.price,
        specialInstructions: item.specialInstructions || item.notes || ''
      }));

      // If using Stripe, create checkout session first without creating an order
      if (paymentMethod === 'stripe') {
        const res = await paymentService.createCheckoutSessionWithCart({
          cart: {
            items: orderItems,
            totalAmount: totalAmount,
          },
          address: {
            street: address.street,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            additionalInfo: address.additionalInfo,
          },
          paymentMethod,
          notes,
          userId: user ? user._id : undefined,
        });
        
        if (res.status === 'success' && res.url) {
          // Clear cart trước khi redirect sang Stripe
          await clearCart();
          window.location.href = res.url;
          return;
        } else {
          toast.error(res.message || t('checkoutPage.stripeCheckoutError'));
          setError(res.message || t('checkoutPage.stripeCheckoutError'));
          return;
        }
      }
      
      // For non-Stripe payment methods, create the order
      console.log('Creating order with payment method:', paymentMethod);
      
      const orderData = await orderService.create({
        items: orderItems,
        deliveryAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          additionalInfo: address.additionalInfo
        },
        paymentMethod,
        specialInstructions: notes,
        totalAmount: totalAmount,
      });
      
      console.log('orderData:', orderData);
      
      if (!orderData || orderData.status !== 'success') {
        throw new Error(orderData?.message || t('checkoutPage.orderCreationError'));
      }

      const orderId = orderData.data._id;
      
      // Handle different payment methods
      if (paymentMethod === 'banking') {
        router.push(`/${lng}/checkout/payment/${orderId}`);
      } else {
        toast.success(t('checkoutPage.orderCreatedSuccess'));
        // For COD payment method, go to order success page
        router.push(`/${lng}/order/success?orderId=${orderId}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Checkout error:', error);
        setError(error.message || t('checkoutPage.checkoutError'));
        toast.error(error.message || t('checkoutPage.checkoutError'));
      } else {
        setError(t('checkoutPage.checkoutError'));
        toast.error(t('checkoutPage.checkoutError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('checkoutPage.loginRequiredTitle')}</h1>
          <p className="text-gray-600 mb-6">{t('checkoutPage.loginRequiredMessage')}</p>
          <button
            onClick={() => router.push(`/${lng}/auth`)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            {t('checkoutPage.loginButton')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      <h1 className="text-3xl font-bold mb-8">{t('checkoutPage.pageTitle')}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Delivery Address */}
            <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
              <div className="flex items-center mb-4">
                <MapPin className="text-green-600 mr-2" />
                <h2 className="text-xl font-semibold">{t('checkoutPage.deliveryAddressTitle')}</h2>
              </div>
              {isLoadingAddresses ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin w-6 h-6 text-green-600 mr-2" />
                  <span className="text-gray-500 text-lg">{t('checkoutPage.loadingAddresses')}</span>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">{t('checkoutPage.noAddressesYet')}</p>
                  <button
                    type="button"
                    onClick={() => router.push(`/${lng}/account/addresses`)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    {t('checkoutPage.addAddressButton')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((address) => {
                    const isSelected = selectedAddress === address._id;
                    return (
                      <label
                        key={address._id}
                        htmlFor={`address-${address._id}`}
                        className={`relative cursor-pointer group transition-all border-2 rounded-2xl p-5 flex flex-col gap-2 shadow-md hover:shadow-xl bg-white\n                          ${isSelected ? 'border-green-600 ring-2 ring-green-200' : 'border-gray-200'}\n                        `}
                      >
                        <input
                          type="radio"
                          id={`address-${address._id}`}
                          name="deliveryAddress"
                          value={address._id}
                          checked={isSelected}
                          onChange={() => setSelectedAddress(address._id)}
                          className="absolute opacity-0 pointer-events-none"
                        />
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-5 h-5 text-blue-500" />
                          <span className="font-semibold text-lg text-gray-900">{address.name || user?.name}</span>
                          {address.isDefault && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{t('checkoutPage.defaultAddress')}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 text-base">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{address.street}, {address.city}, {address.state}, {address.postalCode}</span>
                        </div>
                        {address.additionalInfo && (
                          <div className="text-sm text-gray-500 italic pl-7">{address.additionalInfo}</div>
                        )}
                        <div className="flex items-center gap-2 text-gray-700 text-base pl-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{address.phone}</span>
                        </div>
                        {isSelected && (
                          <span className="absolute top-3 right-3 bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow">{t('checkoutPage.currentlySelected')}</span>
                        )}
                      </label>
                    );
                  })}
                
                </div>
              )}
            </div>
            
            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="text-green-600 mr-2" />
                <h2 className="text-xl font-semibold">{t('checkoutPage.paymentMethodTitle')}</h2>
              </div>
              
              <div className="space-y-3">
                <div className="border rounded-md p-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="payment-cod"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mr-3"
                    />
                    <label htmlFor="payment-cod" className="flex-grow cursor-pointer">
                      <div className="font-medium">{t('checkoutPage.codPaymentMethod')}</div>
                      <div className="text-gray-600 text-sm">{t('checkoutPage.codPaymentDescription')}</div>
                    </label>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="payment-stripe"
                      name="paymentMethod"
                      value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={() => setPaymentMethod('stripe')}
                      className="mr-3"
                    />
                    <label htmlFor="payment-stripe" className="flex-grow cursor-pointer">
                      <div className="font-medium">{t('checkoutPage.stripePaymentMethod')}</div>
                      <div className="text-gray-600 text-sm">{t('checkoutPage.stripePaymentDescription')}</div>
                    </label>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="payment-banking"
                      name="paymentMethod"
                      value="banking"
                      checked={paymentMethod === 'banking'}
                      onChange={() => setPaymentMethod('banking')}
                      className="mr-3"
                    />
                    <label htmlFor="payment-banking" className="flex-grow cursor-pointer">
                      <div className="font-medium">{t('checkoutPage.bankTransferPaymentMethod')}</div>
                      <div className="text-gray-600 text-sm">{t('checkoutPage.bankTransferPaymentDescription')}</div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional Notes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Truck className="text-green-600 mr-2" />
                <h2 className="text-xl font-semibold">{t('checkoutPage.deliveryNotesTitle')}</h2>
              </div>
              
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('checkoutPage.deliveryNotesPlaceholder')}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
              ></textarea>
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md">
                {t('checkoutPage.errorPrefix')}{error}
              </div>
            )}
            
            <div className="flex justify-between items-center mt-8">
              <Link
                href={`/${lng}/cart`}
                className="text-green-600 hover:text-green-800 font-medium flex items-center"
              >
                <ShoppingBag className="mr-2 h-4 w-4" /> {t('checkoutPage.backToCart')}
              </Link>
              
              <button
                type="submit"
                disabled={isLoading || addresses.length === 0}
                className={`${
                  isLoading || addresses.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                } text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center`}
              >
                {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                {isLoading ? t('checkoutPage.processingOrder') : t('checkoutPage.placeOrder')}
              </button>
            </div>
          </form>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">{t('checkoutPage.orderSummaryTitle')}</h2>
            
            <div className="divide-y mb-4">
              {items.map((item) => (
                <div key={item._id} className="py-3 flex justify-between">
                  <div>
                    <span className="font-medium">{item.quantity}x </span>
                    {getMenuItemName(item.menuItem, lng)}
                  </div>
                  <div className="font-medium">
                    {new Intl.NumberFormat(lng === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(item.menuItem.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>{t('checkoutPage.subtotal')}</span>
                <span>{new Intl.NumberFormat(lng === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(totalAmount)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>{t('checkoutPage.shippingFee')}</span>
                <span>{new Intl.NumberFormat(lng === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(30000)}</span>
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                <span>{t('checkoutPage.total')}</span>
                <span>{new Intl.NumberFormat(lng === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(totalAmount + 30000)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
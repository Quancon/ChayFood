'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, AlertTriangle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { orderService } from '../../../services/orderService';
import { paymentService } from '../../../services/paymentService';
import { promotionService } from '../../../../lib/services/promotionService';
import { PaymentMethodCard } from '../../../../components/PaymentMethodCard';
import Image from 'next/image';
import { Promotion } from '../../../../lib/services/types';
import { useTranslation } from 'react-i18next';

// Move paymentMethods array outside the component
// Note: Icons are components and cannot be directly translated as strings.
// Their labels and descriptions will be translated.
const paymentMethods = [
  {
    key: 'momo',
    label: 'paymentPage.method.momo.label',
    icon: <Image src="/assets/momo.png" alt="MoMo" width={40} height={40} className="object-contain" />,
    description: 'paymentPage.method.momo.description',
  },
  {
    key: 'banking',
    label: 'paymentPage.method.banking.label',
    icon: (
      <div className="flex gap-2">
        <Image src="/assets/vietcombank.png" alt="Vietcombank" width={32} height={32} className="object-contain" />
        <Image src="/assets/techcombank.png" alt="Techcombank" width={32} height={32} className="object-contain" />
      </div>
    ),
    description: 'paymentPage.method.banking.description',
  }
];

interface OrderItem {
  menuItem: { name: string };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const { orderId, lng } = params as { orderId: string; lng: string };
  const { t } = useTranslation();
  
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const hasRedirected = useRef(false);
  
  // Promotion states
  const [promotionCode, setPromotionCode] = useState<string>('');
  const [isApplyingPromotion, setIsApplyingPromotion] = useState(false);
  const [appliedPromotion, setAppliedPromotion] = useState<Promotion | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [activePromotions, setActivePromotions] = useState<Promotion[]>([]);

  // Load active promotions
  useEffect(() => {
    const fetchActivePromotions = async () => {
      try {
        const response = await promotionService.getAll({ 
          isActive: true, 
          status: 'active'
        });
        
        if (response.status === 'success' && response.data.promotions) {
          setActivePromotions(response.data.promotions);
        }
      } catch (error) {
        console.error('Error fetching promotions:', error);
      }
    };

    fetchActivePromotions();
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      if (hasRedirected.current) return;

      try {
        setIsLoading(true);
        setError(null);

        const data = await orderService.getById(orderId);
        if (data) {
          setOrder(data as Order);
          setSelectedPaymentMethod(data.paymentMethod || 'banking');
          
          // Check if order is already paid
          if (data.paymentStatus === 'paid') {
            toast.success(t('paymentPage.alreadyPaid'));
            router.push(`/${lng}/order/${orderId}`);
            return;
          }
          
        } else {
          throw new Error(t('paymentPage.loadOrderError'));
        }
      } catch {
        setError(t('paymentPage.loadOrderError'));
        toast.error(t('paymentPage.loadOrderError'));
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId && !hasRedirected.current) {
      fetchOrder();
    }
  }, [orderId, router, lng, t]);

  const handleSelectPaymentMethod = async (method: string) => {
    setSelectedPaymentMethod(method);
    
    if (method === 'stripe') {
      try {
        setIsLoading(true);
        const res = await paymentService.createCheckoutSession(orderId);
        if (res.status === 'success' && res.url) {
          hasRedirected.current = true;
          window.location.href = res.url;
        } else {
          toast.error(res.message || t('paymentPage.stripeError'));
        }
      } catch {
        toast.error(t('paymentPage.checkoutSessionError'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const applyPromotionCode = async () => {
    if (!promotionCode.trim()) {
      toast.error(t('paymentPage.enterPromoCode'));
      return;
    }

    try {
      setIsApplyingPromotion(true);
      
      // First check if the code exists in active promotions
      const foundPromotion = activePromotions.find(
        promo => promo.code.toLowerCase() === promotionCode.toLowerCase() && promo.isActive
      );

      if (!foundPromotion) {
        // If not found in cache, try to fetch from API
        try {
          // This is a mock implementation - you might need to adjust based on your actual API
          const response = await fetch(`/${lng}/api/promotions/validate?code=${encodeURIComponent(promotionCode)}`);
          const data = await response.json();
          
          if (data.status === 'success' && data.data) {
            calculateDiscount(data.data);
          } else {
            toast.error(t('paymentPage.invalidPromoCode'));
          }
        } catch {
          toast.error(t('paymentPage.promoCodeValidationFailed'));
        }
      } else {
        // Found valid promotion in our active promotions
        calculateDiscount(foundPromotion);
      }
    } catch {
      toast.error(t('paymentPage.applyPromoCodeError'));
    } finally {
      setIsApplyingPromotion(false);
    }
  };

  const calculateDiscount = (promotion: Promotion) => {
    if (!order) return;
    
    let discount = 0;
    const subtotal = order.totalAmount - 30000; // Subtract shipping fee

    // Check minimum order value if set
    if (promotion.minOrderValue && subtotal < promotion.minOrderValue) {
      toast.error(t('paymentPage.minOrderValueError', { value: promotion.minOrderValue.toLocaleString(lng) }));
      return;
    }

    // Calculate discount based on promotion type
    if (promotion.type === 'percentage') {
      discount = subtotal * (promotion.value / 100);
      // Apply max discount if specified
      if (promotion.maxDiscount && discount > promotion.maxDiscount) {
        discount = promotion.maxDiscount;
      }
    } else if (promotion.type === 'fixed') {
      discount = promotion.value;
    } else if (promotion.type === 'free_item') {
      discount = 0; // Free item means no monetary discount here
    } else if (promotion.type === 'free_delivery') {
      discount = 30000; // Assuming delivery fee is 30,000 VND
    }

    // Round to nearest whole number
    discount = Math.round(discount);
    
    setAppliedPromotion(promotion);
    setDiscountAmount(discount);
    toast.success(t('paymentPage.promoCodeApplied', { name: promotion.name }));
  };

  const removePromotion = () => {
    setAppliedPromotion(null);
    setDiscountAmount(0);
    setPromotionCode('');
    toast.success(t('paymentPage.promoCodeRemoved'));
  };

  const handleCancel = () => {
    router.push(`/${lng}/order/${orderId}`);
  };

  const handleSuccess = () => {
    router.push(`/${lng}/order/success?orderId=${orderId}`);
  };

  const getFinalAmount = () => {
    if (!order) return 0;
    return Math.max(0, order.totalAmount - discountAmount);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lng, { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
        <p className="text-gray-600">{t('paymentPage.loadingPaymentInfo')}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('paymentPage.paymentErrorTitle')}</h1>
          <p className="text-gray-600 mb-6">{error || t('paymentPage.genericError')}</p>
          <button
            onClick={() => router.push(`/${lng}/menu`)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            {t('common.backToMenu')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-green-700">{t('paymentPage.title')}</h1>
        
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('paymentPage.orderSummary')}</h2>
          <p className="text-xl font-bold text-green-600">{formatCurrency(getFinalAmount())}</p>
        </div>

        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-700">{t('paymentPage.items')}</h3>
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-gray-600 border-b pb-2 last:border-b-0">
              <span>{item.quantity}x {item.menuItem.name}</span>
              <span>{formatCurrency(item.quantity * item.price)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center text-gray-700 font-semibold pt-2">
            <span>{t('paymentPage.subtotal')}</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-green-600">
              <span>{t('paymentPage.discount')} ({appliedPromotion?.name || t('paymentPage.promotion')})</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">{t('paymentPage.selectPaymentMethod')}</h2>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.key}
                method={method.key}
                label={t(method.label)}
                description={t(method.description)}
                icon={method.icon}
                isSelected={selectedPaymentMethod === method.key}
                onSelect={handleSelectPaymentMethod}
              />
            ))}
          </div>
        </div>

        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">{t('paymentPage.applyPromotion')}</h3>
          {!appliedPromotion ? (
            <div className="flex">
              <input
                type="text"
                placeholder={t('paymentPage.promoCodePlaceholder')}
                value={promotionCode}
                onChange={(e) => setPromotionCode(e.target.value)}
                className="flex-grow p-2 border rounded-l-md focus:ring-green-500 focus:border-green-500"
              />
              <button
                onClick={applyPromotionCode}
                className="bg-green-600 text-white px-4 py-2 rounded-r-md hover:bg-green-700"
                disabled={isApplyingPromotion}
              >
                {isApplyingPromotion ? <Loader2 className="h-5 w-5 animate-spin" /> : t('paymentPage.apply')}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-green-100 text-green-800 p-3 rounded-md">
              <span className="font-medium">{t('paymentPage.appliedPromo')}: {appliedPromotion.name}</span>
              <button onClick={removePromotion}>
                <X className="h-5 w-5 text-green-700 hover:text-green-900" />
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center text-2xl font-bold text-green-800 mb-6">
          <span>{t('paymentPage.finalAmount')}</span>
          <span>{formatCurrency(getFinalAmount())}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSuccess}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {t('paymentPage.confirmAndPay')}
          </button>
        </div>
      </div>
    </div>
  );
} 
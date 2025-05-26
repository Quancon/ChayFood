'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, ArrowLeft, CheckCircle, AlertTriangle, Tag, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { orderService } from '../../../services/orderService';
import { paymentService } from '../../../services/paymentService';
import { promotionService } from '../../../lib/services/promotionService';
import { PaymentMethodCard } from '../../../components/PaymentMethodCard';
import Image from 'next/image';
import { Promotion } from '../../../lib/services/types';

// Move paymentMethods array outside the component
const paymentMethods = [
  {
    key: 'momo',
    label: 'Ví MoMo',
    icon: <Image src="/assets/momo.png" alt="MoMo" width={40} height={40} className="object-contain" />,
    description: 'Thanh toán qua ví điện tử MoMo (quét QR hoặc chuyển khoản).',
  },
  {
    key: 'banking',
    label: 'Chuyển khoản ngân hàng',
    icon: (
      <div className="flex gap-2">
        <Image src="/assets/vietcombank.png" alt="Vietcombank" width={32} height={32} className="object-contain" />
        <Image src="/assets/techcombank.png" alt="Techcombank" width={32} height={32} className="object-contain" />
      </div>
    ),
    description: 'Chuyển khoản qua các ngân hàng nội địa Việt Nam.',
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
  const orderId = params.orderId as string;
  
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
            toast.success('Đơn hàng này đã được thanh toán!');
            router.push(`/order/${orderId}`);
            return;
          }
          
        } else {
          throw new Error('Không thể tải thông tin đơn hàng');
        }
      } catch {
        setError('Đã xảy ra lỗi khi tải thông tin đơn hàng');
        toast.error('Đã xảy ra lỗi khi tải thông tin đơn hàng');
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId && !hasRedirected.current) {
      fetchOrder();
    }
  }, [orderId, router]);

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
          toast.error(res.message || 'Không thể tạo phiên thanh toán Stripe');
        }
      } catch {
        toast.error('Đã xảy ra lỗi khi tạo phiên thanh toán');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const applyPromotionCode = async () => {
    if (!promotionCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
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
          const response = await fetch(`/api/promotions/validate?code=${encodeURIComponent(promotionCode)}`);
          const data = await response.json();
          
          if (data.status === 'success' && data.data) {
            calculateDiscount(data.data);
          } else {
            toast.error('Mã giảm giá không hợp lệ hoặc đã hết hạn');
          }
        } catch {
          toast.error('Không thể xác thực mã giảm giá');
        }
      } else {
        // Found valid promotion in our active promotions
        calculateDiscount(foundPromotion);
      }
    } catch {
      toast.error('Đã xảy ra lỗi khi áp dụng mã giảm giá');
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
      toast.error(`Đơn hàng tối thiểu ${promotion.minOrderValue.toLocaleString('vi-VN')}₫ để sử dụng mã này`);
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
    } else if (promotion.type === 'free_delivery') {
      discount = 30000; // Assuming delivery fee is 30,000 VND
    }

    // Round to nearest whole number
    discount = Math.round(discount);
    
    setAppliedPromotion(promotion);
    setDiscountAmount(discount);
    toast.success(`Đã áp dụng mã "${promotion.name}"`);
  };

  const removePromotion = () => {
    setAppliedPromotion(null);
    setDiscountAmount(0);
    setPromotionCode('');
    toast.success('Đã hủy mã giảm giá');
  };

  const handleCancel = () => {
    router.push(`/order/${orderId}`);
  };

  const handleSuccess = () => {
    router.push(`/order/success?orderId=${orderId}`);
  };

  const getFinalAmount = () => {
    if (!order) return 0;
    return Math.max(0, order.totalAmount - discountAmount);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
        <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-4">Lỗi thanh toán</h1>
          <p className="text-gray-600 mb-6">{error || 'Không thể tải thông tin đơn hàng'}</p>
          <button
            onClick={() => router.push('/cart')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Quay lại giỏ hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Thanh toán đơn hàng</h1>
            <div className="px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              #{orderId.substring(0, 8)}
            </div>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full mb-6">
            <div className="h-2 bg-green-500 rounded-full w-3/4"></div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center mb-6">
            <div className="text-green-600">
              <div className="flex justify-center">
                <CheckCircle className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">Giỏ hàng</span>
            </div>
            <div className="text-green-600">
              <div className="flex justify-center">
                <CheckCircle className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">Thông tin</span>
            </div>
            <div className="text-green-600 font-bold">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-600 text-white h-6 w-6 flex items-center justify-center">3</div>
              </div>
              <span className="text-sm">Thanh toán</span>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Phương thức thanh toán</h2>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <PaymentMethodCard
                    key={method.key}
                    icon={method.icon}
                    label={method.label}
                    description={method.description}
                    selected={selectedPaymentMethod === method.key}
                    onClick={() => handleSelectPaymentMethod(method.key)}
                  />
                ))}
              </div>
            </div>

            {/* Promotion Code Section */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2 text-green-600" />
                Mã giảm giá
              </h2>
              
              {appliedPromotion ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-green-800 font-medium mb-1 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {appliedPromotion.name}
                      </div>
                      <div className="text-green-700 text-sm">{appliedPromotion.description}</div>
                      <div className="mt-2 text-sm font-medium text-green-800">
                        Tiết kiệm: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}
                      </div>
                    </div>
                    <button 
                      onClick={removePromotion}
                      className="text-gray-500 hover:text-red-500 p-1"
                      title="Xóa mã giảm giá"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={promotionCode}
                    onChange={(e) => setPromotionCode(e.target.value)}
                    placeholder="Nhập mã giảm giá"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    onClick={applyPromotionCode}
                    disabled={isApplyingPromotion || !promotionCode.trim()}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      isApplyingPromotion || !promotionCode.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    } transition`}
                  >
                    {isApplyingPromotion ? (
                      <div className="flex items-center">
                        <Loader2 className="animate-spin h-4 w-4 mr-1" />
                        Đang áp dụng...
                      </div>
                    ) : (
                      'Áp dụng'
                    )}
                  </button>
                </div>
              )}
              
              {/* Available Promotions */}
              {!appliedPromotion && activePromotions.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Mã giảm giá có sẵn</h3>
                  <div className="space-y-2">
                    {activePromotions.slice(0, 3).map((promo) => (
                      <div 
                        key={promo._id}
                        className="border border-dashed border-orange-300 bg-orange-50 rounded-lg p-3 cursor-pointer hover:border-orange-400"
                        onClick={() => {
                          setPromotionCode(promo.code);
                          calculateDiscount(promo);
                        }}
                      >
                        <div className="flex justify-between">
                          <div className="font-medium text-orange-800">{promo.name}</div>
                          <div className="text-orange-700 font-mono bg-white px-2 py-1 rounded text-xs">{promo.code}</div>
                        </div>
                        <div className="text-xs text-orange-700 mt-1">{promo.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedPaymentMethod === 'banking' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">Thông tin chuyển khoản</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngân hàng:</span>
                    <span className="font-medium">Vietcombank</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tài khoản:</span>
                    <span className="font-medium">1234567890</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chủ tài khoản:</span>
                    <span className="font-medium">CONG TY CP CHAYFOOD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nội dung CK:</span>
                    <span className="font-medium">CHAYFOOD {orderId.substring(0, 8)}</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-sm text-yellow-800">
                  <strong>Lưu ý:</strong> Vui lòng điền chính xác nội dung chuyển khoản để chúng tôi có thể xác nhận thanh toán của bạn.
                </div>
              </div>
            )}

            {selectedPaymentMethod === 'momo' && (
              <div className="bg-pink-50 border border-pink-200 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold mb-3 text-pink-800">Thanh toán qua MoMo</h3>
                <div className="mb-4">
                  <Image 
                    src="/assets/momo-qr.png" 
                    alt="MoMo QR Code" 
                    width={200} 
                    height={200} 
                    className="mx-auto border-4 border-white shadow-md rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "https://placehold.co/200x200/pink/white?text=MoMo+QR";
                    }}
                  />
                </div>
                <div className="space-y-2 text-left mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số điện thoại:</span>
                    <span className="font-medium">0123456789</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tên tài khoản:</span>
                    <span className="font-medium">CHAYFOOD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nội dung CK:</span>
                    <span className="font-medium">CHAYFOOD {orderId.substring(0, 8)}</span>
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-sm text-yellow-800">
                  <strong>Lưu ý:</strong> Quét mã QR bằng ứng dụng MoMo hoặc chuyển khoản theo thông tin trên.
                </div>
              </div>
            )}
          </div>
          
          <div className="md:col-span-2">
            <div className="bg-gray-50 rounded-xl p-6 sticky top-20">
              <h2 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h2>
              
              <div className="divide-y mb-4">
                {order.items.map((item: OrderItem, index: number) => (
                  <div key={index} className="py-3 flex justify-between">
                    <div>
                      <span className="font-medium">{item.quantity}x </span>
                      {item.menuItem.name}
                    </div>
                    <div className="font-medium">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Tạm tính</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount - 30000)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Phí vận chuyển</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(30000)}</span>
                </div>
                
                {/* Discount row */}
                {discountAmount > 0 && (
                  <div className="flex justify-between mb-2 text-green-700">
                    <span>Giảm giá</span>
                    <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                  <span>Tổng cộng</span>
                  <span className={discountAmount > 0 ? 'flex flex-col items-end' : ''}>
                    {discountAmount > 0 && (
                      <span className="text-sm text-gray-500 line-through">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                      </span>
                    )}
                    <span className={discountAmount > 0 ? 'text-green-700' : ''}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(getFinalAmount())}
                    </span>
                  </span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Bạn đã tiết kiệm {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex flex-col gap-3">
                {selectedPaymentMethod === 'banking' && (
                  <button
                    onClick={handleSuccess}
                    className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
                  >
                    Tôi đã thanh toán
                  </button>
                )}
                {selectedPaymentMethod === 'momo' && (
                  <button
                    onClick={handleSuccess}
                    className="w-full py-3 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition"
                  >
                    Tôi đã thanh toán qua MoMo
                  </button>
                )}
                <button
                  onClick={handleCancel}
                  className="w-full py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
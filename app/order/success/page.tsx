'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Home, ShoppingBag } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Loader2 } from 'lucide-react';
import { orderService, Order } from '../../services/orderService';
import { useCart } from '../../hooks/useCart';
import CartToast from '../../components/cart-toast';

export default function OrderSuccessPageWrapper() {
  return (
    <Suspense>
      <OrderSuccessPage />
    </Suspense>
  );
}

function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const sessionId = searchParams.get('session_id');
  
  const [order, setOrder] = useState<Order | null>(null);
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
          setOrder(data);
          if (!clearedRef.current) {
            await clearCart();
            clearedRef.current = true;
          }
        } else {
          throw new Error('Không thể tải thông tin đơn hàng');
        }
      } catch (error: unknown) {
        console.error('Error fetching order:', error);
        setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải thông tin đơn hàng');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, sessionId, clearCart]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
        <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (!orderId && !sessionId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Không tìm thấy đơn hàng</h1>
          <p className="text-gray-600 mb-6">Không tìm thấy mã đơn hàng hoặc mã phiên thanh toán. Vui lòng kiểm tra lại.</p>
          <Button onClick={() => router.push('/')} className="bg-green-600 hover:bg-green-700">
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/')} className="bg-green-600 hover:bg-green-700">
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Không tìm thấy thông tin đơn hàng</h1>
          <p className="text-gray-600 mb-6">Không thể tìm thấy thông tin đơn hàng. Đơn hàng có thể đang được xử lý.</p>
          <Button onClick={() => router.push('/')} className="bg-green-600 hover:bg-green-700">
            Quay lại trang chủ
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
          <h1 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h1>
          <p className="text-gray-600">
            Cảm ơn bạn đã đặt hàng tại ChayFood. Đơn hàng của bạn đã được xác nhận.
          </p>
        </div>
        
        {order && (
          <div className="mb-8">
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h2 className="text-lg font-semibold mb-2">Chi tiết đơn hàng</h2>
              <p className="text-gray-600 mb-1">Mã đơn hàng: <span className="font-medium">{order._id}</span></p>
              <p className="text-gray-600 mb-1">Trạng thái: <span className="font-medium text-green-600">{order.status === 'confirmed' ? 'Đã xác nhận' : 'Đang xử lý'}</span></p>
              <p className="text-gray-600 mb-1">Thanh toán: <span className="font-medium text-green-600">{order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</span></p>
              <p className="text-gray-600">Tổng tiền: <span className="font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</span></p>
            </div>
            
            <div className="border-t border-b py-4 space-y-2 mb-4">
              <h3 className="text-md font-semibold mb-2">Món ăn đã đặt</h3>
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.quantity}x {typeof item.menuItem === 'object' ? item.menuItem.name : 'Sản phẩm'}</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-md font-semibold mb-2">Địa chỉ giao hàng</h3>
              <p className="text-gray-600">
                {`${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state}, ${order.deliveryAddress.postalCode}`}
                {order.deliveryAddress.additionalInfo && ` (${order.deliveryAddress.additionalInfo})`}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href={`/order/${displayOrderId}`} passHref>
            <Button variant="outline" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Chi tiết đơn hàng
            </Button>
          </Link>
          <Link href="/menu" passHref>
            <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
              <Home className="h-4 w-4" />
              Tiếp tục mua sắm
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
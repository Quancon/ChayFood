"use client"

import { useRouter } from 'next/navigation';
import { useCart } from '../hooks/useCart';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { CartItem } from '../lib/actions/cartActions';

// Hàm format tiền tệ VND
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(amount);
};

export default function CartPage() {
  const { 
    items, 
    totalItems, 
    totalAmount, 
    increaseQuantity, 
    decreaseQuantity, 
    removeItem, 
    clearCart, 
    isCartEmpty,
    proceedToCheckout,
    refresh
  } = useCart();
  
  const router = useRouter();
  const [safeItems, setSafeItems] = useState<CartItem[]>([]);

  // Đảm bảo items là mảng và cập nhật safeItems
  useEffect(() => {
    console.log("Cart items: ", items);
    if (Array.isArray(items)) {
      setSafeItems(items);
    } else {
      console.error("Items is not an array:", items);
      setSafeItems([]);
      // Thử refresh cart
      refresh();
    }
  }, [items, refresh]);

  if (isCartEmpty || safeItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Giỏ hàng của bạn đang trống</h2>
          <p className="text-gray-600 mb-8">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
          <button
            onClick={() => router.push('/menu')}
            className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            Xem Thực Đơn
          </button>
        </div>
      </div>
    );
  }

  // Phí vận chuyển
  const deliveryFee = 30000;

  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      <h1 className="text-3xl font-bold mb-8">Giỏ Hàng Của Bạn</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Giỏ hàng ({totalItems} {totalItems === 1 ? 'sản phẩm' : 'sản phẩm'})</h2>
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Xóa Tất Cả
                </button>
              </div>
            </div>
            
            <div className="divide-y">
              {safeItems.map((item) => (
                <div key={item.menuItem && item.menuItem._id ? item.menuItem._id : `item-${Math.random()}`} className="p-4 flex">
                  <div className="relative h-24 w-24 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={item.menuItem?.image || 'https://placekitten.com/200/200'}
                      alt={item.menuItem?.name || 'Menu Item'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-grow ml-4">
                    <div className="flex justify-between">
                      <h3 className="font-medium">
                        {item.menuItem?.name || 'Sản phẩm'}
                      </h3>
                      <p className="font-semibold">
                        {formatCurrency((item.menuItem?.price || 0) * (item.quantity || 0))}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {formatCurrency(item.menuItem?.price || 0)} mỗi sản phẩm
                    </p>
                    
                    {(item.specialInstructions || item.notes) && (
                      <p className="text-xs text-gray-500 mb-2 italic">Ghi chú: {item.specialInstructions || item.notes}</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => {
                            if (item._id) {
                              decreaseQuantity(item._id);
                            } else if (item.menuItem?._id) {
                              decreaseQuantity(item.menuItem._id);
                            }
                          }}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-3 py-1">{item.quantity || 0}</span>
                        <button
                          onClick={() => {
                            if (item._id) {
                              increaseQuantity(item._id);
                            } else if (item.menuItem?._id) {
                              increaseQuantity(item.menuItem._id);
                            }
                          }}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          if (item._id) {
                            removeItem(item._id);
                          } else if (item.menuItem?._id) {
                            removeItem(item.menuItem._id);
                          }
                        }}
                        className="text-gray-500 hover:text-red-500"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Tóm Tắt Đơn Hàng</h2>
            <div className="border-b pb-4 mb-4">
              <div className="flex justify-between mb-2">
                <span>Tạm tính</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Phí vận chuyển</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-gray-100">
                <span>Tổng cộng</span>
                <span>{formatCurrency(totalAmount + deliveryFee)}</span>
              </div>
            </div>
            
            <button
              onClick={proceedToCheckout}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              Tiến Hành Thanh Toán
            </button>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => router.push('/menu')}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Tiếp Tục Mua Hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
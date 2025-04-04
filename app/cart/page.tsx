"use client"

import { useRouter } from 'next/navigation';
import { useCart } from '../hooks/useCart';
import Image from 'next/image';

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
    proceedToCheckout
  } = useCart();
  
  const router = useRouter();

  if (isCartEmpty) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <button
            onClick={() => router.push('/menu')}
            className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})</h2>
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Clear Cart
                </button>
              </div>
            </div>
            
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.menuItem._id} className="p-4 flex">
                  <div className="relative h-24 w-24 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={item.menuItem.image || 'https://placekitten.com/200/200'}
                      alt={item.menuItem.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-grow ml-4">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{item.menuItem.name}</h3>
                      <p className="font-semibold">${(item.menuItem.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">${item.menuItem.price.toFixed(2)} each</p>
                    
                    {item.specialInstructions && (
                      <p className="text-xs text-gray-500 mb-2 italic">Note: {item.specialInstructions}</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => decreaseQuantity(item.menuItem._id)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-3 py-1">{item.quantity}</span>
                        <button
                          onClick={() => increaseQuantity(item.menuItem._id)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.menuItem._id)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        Remove
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
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="border-b pb-4 mb-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Delivery Fee</span>
                <span>$3.99</span>
              </div>
              <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>${(totalAmount + 3.99).toFixed(2)}</span>
              </div>
            </div>
            
            <button
              onClick={proceedToCheckout}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              Proceed to Checkout
            </button>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => router.push('/menu')}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
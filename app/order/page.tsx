'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../lib/services';
import { CreateOrderDto } from '../lib/services/types';
import Image from 'next/image';

export default function OrderPage() {
  const { items, totalAmount, clearCart, isCartEmpty } = useCart();
  const { isAuthenticated, user } = useAuth();
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
      router.push('/login?redirect=order');
      return;
    }

    if (isCartEmpty) {
      router.push('/cart');
      return;
    }
  }, [isAuthenticated, isCartEmpty, router]);

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
          menuItem: item.menuItem._id,
          quantity: item.quantity,
          price: item.menuItem.price,
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
      setError('Failed to create order. Please try again.');
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
            <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your order. Your order has been received and is being processed.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 w-full mb-6">
              <p className="text-sm text-gray-600">Order ID: <span className="font-medium">{orderCreated.orderId}</span></p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={() => router.push(`/order/${orderCreated.orderId}`)}
                className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                View Order Details
              </button>
              <button
                onClick={() => router.push('/menu')}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Continue Shopping
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
          <h1 className="text-3xl font-bold mb-8">Complete Your Order</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
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
                    City *
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
                    State *
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
                    Postal Code *
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
                    Additional Info (Apartment, Floor, etc.)
                  </label>
                  <input
                    type="text"
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-green-500 focus:ring-green-500"
                  />
                  <div className="ml-3">
                    <span className="block font-medium">Cash on Delivery</span>
                    <span className="block text-sm text-gray-500">Pay when your order arrives</span>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-green-500 focus:ring-green-500"
                  />
                  <div className="ml-3">
                    <span className="block font-medium">Credit Card</span>
                    <span className="block text-sm text-gray-500">Pay securely with your card</span>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="banking"
                    checked={formData.paymentMethod === 'banking'}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-green-500 focus:ring-green-500"
                  />
                  <div className="ml-3">
                    <span className="block font-medium">Online Banking</span>
                    <span className="block text-sm text-gray-500">Pay via bank transfer</span>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Special Instructions</h2>
              <textarea
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any special instructions for delivery or food preparation..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              ></textarea>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white ${
                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
              } transition-colors`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full" />
                  Processing...
                </span>
              ) : (
                'Place Order'
              )}
            </button>
          </form>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="max-h-80 overflow-y-auto mb-4">
              {items.map((item, index) => (
                <div key={index} className="flex py-3 border-b border-gray-100 last:border-0">
                  {item.menuItem.image && (
                    <div className="relative h-16 w-16 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-grow ml-4">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{item.menuItem.name} × {item.quantity}</h3>
                      <p className="text-gray-700">${(item.menuItem.price * item.quantity).toFixed(2)}</p>
                    </div>
                    {item.specialInstructions && (
                      <p className="text-sm text-gray-500 mt-1">Note: {item.specialInstructions}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Delivery Fee</span>
                <span>$3.99</span>
              </div>
              <div className="flex justify-between font-bold mt-4">
                <span>Total</span>
                <span>${(totalAmount + 3.99).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
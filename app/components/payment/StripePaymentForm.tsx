'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { getStripe } from '../../lib/stripe';
import { Button } from '../ui/button';
import { toast } from 'react-hot-toast';

interface StripePaymentFormProps {
  orderId: string;
  amount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CardForm = ({ orderId, amount, onSuccess, onCancel }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Create a payment intent on the server
      const response = await fetch(`/api/payment/create-intent/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong with the payment');
      }

      const { data } = await response.json();
      const clientSecret = data.clientSecret;

      // Confirm the payment with Stripe.js
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: 'ChayFood Customer',
          },
        },
      });

      if (result.error) {
        // Show error to customer
        setErrorMessage(result.error.message || 'Payment failed');
        toast.error(result.error.message || 'Payment failed');
      } else if (result.paymentIntent.status === 'succeeded') {
        // Payment succeeded, confirm on server
        const confirmResponse = await fetch(`/api/payment/confirm/${orderId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: result.paymentIntent.id,
          }),
        });

        if (confirmResponse.ok) {
          toast.success('Payment successful!');
          
          // Call onSuccess callback if provided
          if (onSuccess) {
            onSuccess();
          } else {
            // Navigate to success page
            router.push(`/order/success?orderId=${orderId}`);
          }
        } else {
          // Server couldn't confirm the payment
          setErrorMessage('Payment confirmed, but order could not be updated.');
          toast.error('Payment confirmed, but order could not be updated.');
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message || 'An unexpected error occurred');
        toast.error(error.message || 'An unexpected error occurred');
      } else {
        setErrorMessage('An unexpected error occurred');
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Thanh toán đơn hàng</h2>
        <p className="text-gray-600">Tổng tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}</p>
      </div>
      
      <div className="p-4 border rounded-md bg-white">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      
      {errorMessage && (
        <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
      )}

      <div className="flex gap-3 justify-end mt-4">
        <Button 
          type="button" 
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Hủy
        </Button>
        <Button 
          type="submit" 
          disabled={!stripe || isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading ? 'Đang xử lý...' : 'Thanh toán ngay'}
        </Button>
      </div>
    </form>
  );
};

export const StripePaymentForm = ({ orderId, amount, onSuccess, onCancel }: StripePaymentFormProps) => {
  const stripePromise = getStripe();

  return (
    <Elements stripe={stripePromise}>
      <CardForm 
        orderId={orderId} 
        amount={amount} 
        onSuccess={onSuccess} 
        onCancel={onCancel}
      />
    </Elements>
  );
}; 
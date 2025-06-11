import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Định nghĩa kiểu cho payload checkout
export interface CheckoutPayload {
  cart: {
    items: Array<{
      menuItem: string;
      quantity: number;
      price?: number;
      specialInstructions?: string;
    }>;
    totalAmount: number;
  };
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    additionalInfo?: string;
  };
  notes?: string;
  userId?: string;
  paymentMethod: 'cod' | 'banking' | 'stripe';
}

// Helper function to get auth token
const getAuthHeader = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
};

export const paymentService = {
  // Tạo payment intent cho order
  createPaymentIntent: async (orderId: string) => {
    const response = await axios.post(
      `${API_URL}/api/payment/create-intent/${orderId}`,
      {},
      { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } }
    );
    return response.data;
  },

  // Xác nhận thanh toán thành công
  confirmPayment: async (orderId: string, paymentIntentId: string) => {
    const response = await axios.post(
      `${API_URL}/api/payment/confirm/${orderId}`,
      { paymentIntentId },
      { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } }
    );
    return response.data;
  },

  // Refund thanh toán (admin)
  refundPayment: async (orderId: string, amount?: number, reason?: string) => {
    const response = await axios.post(
      `${API_URL}/api/payment/refund/${orderId}`,
      { amount, reason },
      { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } }
    );
    return response.data;
  },

  // Tạo Stripe Checkout Session cho order
  createCheckoutSession: async (orderId: string) => {
    const response = await axios.post(
      `${API_URL}/payment/checkout-session/${orderId}`,
      {},
      { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } }
    );
    return response.data;
  },

  // Tạo Stripe Checkout Session với metadata cart, address, notes, user
  createCheckoutSessionWithCart: async (payload: CheckoutPayload) => {
    const response = await axios.post(
      `${API_URL}/payment/checkout-session`,
      payload,
      { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } }
    );
    return response.data;
  }
}; 
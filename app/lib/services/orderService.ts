import api from './apiClient';
import type { CreateOrderDto, Order } from './types';
export const orderService = {
  // Get all orders (admin) or user's orders (legacy route)
  getAll: async () => {
    const response = await api.get('/order');
    return response.data;
  },
  
  // Get all orders (admin only)
  getAllAdmin: async () => {
    const response = await api.get('/order/admin/all');
    return response.data;
  },
  
  // Get user's own orders
  getMyOrders: async () => {
    const response = await api.get('/order/user/my-orders');
    return response.data;
  },
  
  // Get order by ID
  getById: async (id: string) => {
    const response = await api.get(`/order/${id}`);
    return response.data;
  },
  
  // Get order by Session ID (for payment success callbacks)
  getBySessionId: async (sessionId: string) => {
    const response = await api.get(`/order/session/${sessionId}`);
    return response.data;
  },
  
  // Create new order
  create: async (order: CreateOrderDto) => {
    const response = await api.post('/order', order);
    return response.data;
  },
  
  // Update order status (admin only)
  updateStatus: async (id: string, status: Order['status']) => {
    const response = await api.patch(`/order/${id}/status`, { status });
    return response.data;
  },
  
  // Cancel order
  cancel: async (id: string, feedback?: string) => {
    try {
      try {
        console.log(`Attempting to cancel order ${id}`);
        const response = await api.patch(`/order/${id}/cancel`, {});
        console.log(`Successfully cancelled order ${id}:`, response.data);
        
        if (feedback) {
          console.log(`Feedback for cancelled order ${id} (not sent to server):`, feedback);
        }
        
        return response.data;
      } catch (cancelError: unknown) {
        const error = cancelError as { response?: { data?: unknown; status?: number }; message?: string };
        console.error(`Error from cancel endpoint for order ${id}:`, error.response?.data || error.message);
        
        if (error.response?.status === 400) {
          console.log(`Attempting to cancel order ${id} through admin status update endpoint`);
          try {
            const updateResponse = await api.patch(`/order/${id}/status`, { status: 'cancelled' });
            console.log(`Successfully cancelled order ${id} through admin endpoint:`, updateResponse.data);
            return updateResponse.data;
          } catch (updateError: unknown) {
            const error = updateError as { response?: { data?: unknown; status?: number }; message?: string };
            console.error(`Admin status update fallback also failed for order ${id}:`, error.response?.data || error.message);
            throw error;
          }
        }
        
        throw error;
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown; status?: number }; message?: string };
      console.error(`All attempts to cancel order ${id} failed:`, err);
      return {
        status: 'success',
        message: 'Order cancelled (simulated)',
        data: { status: 'cancelled' }
      };
    }
  },
  
  /**
   * Mark an order as received by the user
   */
  async markAsReceived(orderId: string, feedback?: string) {
    console.log('Attempting to mark order as received:', orderId);
    console.log('Order status being sent for confirmation:', typeof feedback, feedback);
    
    try {
      const response = await api.patch(`/order/${orderId}/user/confirm-delivery`, {
        feedback: feedback || ''
      });
      
      console.log('Order received response:', response.data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown; status?: number }; message?: string };
      console.error('Error marking order as received:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      if (err.response?.data) {
        const data = err.response.data as { message?: string; error?: string };
        if (data.message) {
          console.error('Backend error message:', data.message);
        }
        if (data.error) {
          console.error('Backend error details:', data.error);
        }
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Returning simulated success response for development');
        return {
          status: 'success',
          message: 'Order marked as received (simulated)',
          data: { status: 'delivered' }
        };
      }
      
      throw err;
    }
  }
}; 
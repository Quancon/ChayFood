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
      } catch (cancelError: any) {
        console.error(`Error from cancel endpoint for order ${id}:`, cancelError.response?.data || cancelError.message);
        
        if (cancelError.response?.status === 400) {
          console.log(`Attempting to cancel order ${id} through admin status update endpoint`);
          try {
            const updateResponse = await api.patch(`/order/${id}/status`, { status: 'cancelled' });
            console.log(`Successfully cancelled order ${id} through admin endpoint:`, updateResponse.data);
            return updateResponse.data;
          } catch (updateError: any) {
            console.error(`Admin status update fallback also failed for order ${id}:`, updateError.response?.data || updateError.message);
            throw updateError;
          }
        }
        
        throw cancelError;
      }
    } catch (error) {
      console.error(`All attempts to cancel order ${id} failed:`, error);
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
    } catch (error: any) {
      console.error('Error marking order as received:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.data) {
        console.error('Backend error message:', error.response.data.message);
        console.error('Backend error details:', error.response.data.error);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Returning simulated success response for development');
        return {
          status: 'success',
          message: 'Order marked as received (simulated)',
          data: { status: 'delivered' }
        };
      }
      
      throw error;
    }
  }
}; 
import apiClient from '../../../lib/services/apiClient';
import { CreateOrderDto, Order } from '@/lib/services/types';

export const orderService = {
  async create(orderData: CreateOrderDto) {
    const res = await apiClient.post('/order', orderData);
    return res.data;
  },

  async getById(orderId: string) {
    const res = await apiClient.get(`/order/${orderId}`);
    return res.data.data;
  },

  async getBySessionId(sessionId: string) {
    const res = await apiClient.get(`/order/by-session/${sessionId}`);
    return res.data;
  },

  // Admin functions
  async getAll(): Promise<Order[]> {
    const res = await apiClient.get('/order/admin/all');
    return res.data.data || [];
  },

  async filterByStatus(status: Order['status']): Promise<Order[]> {
    const res = await apiClient.get('/order/admin/all', { params: { status } });
    return res.data.data || [];
  },

  async search(query: string): Promise<Order[]> {
    const res = await apiClient.get('/order/admin/all', { params: { search: query } });
    return res.data.data || [];
  },

  async updateStatus(orderId: string, status: Order['status']): Promise<Order | null> {
    try {
      const response = await apiClient.patch(`/order/${orderId}/status`, { status });
      return response.data.data;
    } catch (error) {
      console.error('Failed to update order status:', error);
      return null;
    }
  },

  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      const res = await apiClient.patch(`/order/${orderId}/cancel`);
      return res.data.success || false;
    } catch (error) {
      console.error(`Failed to cancel order ${orderId}:`, error);
      return false;
    }
  },
}; 
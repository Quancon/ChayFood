import apiClient from '../../lib/axiosInstance';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const cartService = {

  // Lấy giỏ hàng
  getCart: async () => {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.get('/cart', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Thêm sản phẩm vào giỏ hàng
  addToCart: async (menuItemId: string, quantity: number, notes?: string) => {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.post(
      '/cart/items',
      { menuItemId, quantity, notes },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Cập nhật sản phẩm trong giỏ hàng
  updateCartItem: async (cartItemId: string, quantity: number, notes?: string) => {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.put(
      `/cart/items/${cartItemId}`,
      { quantity, notes },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Xóa sản phẩm khỏi giỏ hàng
  removeFromCart: async (cartItemId: string) => {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.delete(
      `/cart/items/${cartItemId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: async () => {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.delete(
      `/cart`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
}; 
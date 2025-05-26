import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const cartService = {
  // Lấy giỏ hàng
  getCart: async () => {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Thêm sản phẩm vào giỏ hàng
  addToCart: async (menuItemId: string, quantity: number, notes?: string) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(
      `${API_URL}/cart/items`,
      { menuItemId, quantity, notes },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Cập nhật sản phẩm trong giỏ hàng
  updateCartItem: async (cartItemId: string, quantity: number, notes?: string) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(
      `${API_URL}/cart/items/${cartItemId}`,
      { quantity, notes },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Xóa sản phẩm khỏi giỏ hàng
  removeFromCart: async (cartItemId: string) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(
      `${API_URL}/cart/items/${cartItemId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: async () => {
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(
      `${API_URL}/cart`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
}; 
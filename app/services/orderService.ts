import axios from 'axios';

export interface Order {
  _id: string;
  user: string | {
    _id: string;
    name: string;
    email: string;
  };
  items: Array<{
    menuItem: string | {
      _id: string;
      name: string;
      price: number;
      image?: string;
    };
    quantity: number;
    price: number;
    specialInstructions?: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'ready' | 'delivered' | 'cancelled';
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    additionalInfo?: string;
  };
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'cod' | 'card' | 'banking';
  deliveryTime?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL = 'http://localhost:5000/';

// Helper function to get auth token
const getAuthHeader = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
};

export const orderService = {
  // Lấy tất cả đơn hàng (admin)
  getAll: async (): Promise<Order[]> => {
    try {
      const response = await axios.get(`${API_URL}/admin/all`, {
        headers: getAuthHeader()
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
  },

  // Lấy đơn hàng theo ID
  getById: async (id: string): Promise<Order | null> => {
    try {
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: getAuthHeader()
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      return null;
    }
  },

  // Cập nhật trạng thái đơn hàng (admin)
  updateStatus: async (id: string, status: Order['status']): Promise<Order | null> => {
    try {
      const response = await axios.patch(
        `${API_URL}/${id}/status`, 
        { status },
        { headers: getAuthHeader() }
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error updating order status ${id}:`, error);
      return null;
    }
  },

  // Hủy đơn hàng (admin hoặc user)
  cancelOrder: async (id: string): Promise<boolean> => {
    try {
      const response = await axios.patch(
        `${API_URL}/${id}/cancel`,
        {},
        { headers: getAuthHeader() }
      );
      return response.status === 200;
    } catch (error) {
      console.error(`Error cancelling order ${id}:`, error);
      return false;
    }
  },

  // Lọc đơn hàng theo trạng thái
  filterByStatus: async (status: Order['status']): Promise<Order[]> => {
    try {
      const response = await axios.get(`${API_URL}/admin/all`, {
        params: { status },
        headers: getAuthHeader()
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error filtering orders by status ${status}:`, error);
      return [];
    }
  },

  // Tìm kiếm đơn hàng
  search: async (query: string): Promise<Order[]> => {
    try {
      const response = await axios.get(`${API_URL}/admin/search`, {
        params: { query },
        headers: getAuthHeader()
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error searching orders with query ${query}:`, error);
      return [];
    }
  }
}; 
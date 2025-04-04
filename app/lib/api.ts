import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage in client-side context
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Type definitions
export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'main' | 'side' | 'dessert' | 'beverage';
  image: string;
  nutritionInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  isAvailable: boolean;
  preparationTime: number;
  ingredients: string[];
  allergens?: string[];
}

export interface Order {
  _id: string;
  user: string;
  items: Array<{
    menuItem: string | MenuItem;
    quantity: number;
    price: number;
    specialInstructions?: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
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

export interface CreateOrderDto {
  items: Array<{
    menuItem: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
  }>;
  totalAmount: number;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    additionalInfo?: string;
  };
  paymentMethod: 'cod' | 'card' | 'banking';
  specialInstructions?: string;
}

// Add type definitions for plans and subscriptions
export interface Plan {
  _id: string;
  name: string;
  code: string;
  price: number;
  duration: number; // in days
  description: string;
  mealsPerDay: number;
  snacksPerDay: number;
  features: string[];
  isRecommended: boolean;
  isPremiumMenu: boolean;
  hasDietitianSupport: boolean;
  hasCustomization: boolean;
  hasPriorityDelivery: boolean;
  has24HrSupport: boolean;
  isActive: boolean;
}

export interface Subscription {
  _id: string;
  user: string;
  plan: Plan;
  startDate: string;
  endDate: string;
  isActive: boolean;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    additionalInfo?: string;
  };
  selectedMenuItems?: Array<{
    menuItemId: string;
    quantity: number;
    dayOfWeek: number; // 0-6 for Sunday-Saturday
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  }>;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'card' | 'banking';
  totalAmount: number;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionDto {
  planId: string;
  startDate: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    additionalInfo?: string;
  };
  paymentMethod: 'card' | 'banking';
  specialInstructions?: string;
}

// User authentication
export const authAPI = {
  checkStatus: async () => {
    const response = await api.get('/auth/status');
    return response.data;
  },
  
  login: async (token: string) => {
    // Store token in localStorage
    localStorage.setItem('authToken', token);
    // Return user information
    const response = await api.get('/auth/status');
    return response.data;
  },
  
  register: async (userData: { name: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },
  
  logout: async () => {
    try {
      // Call the backend logout endpoint if needed
      await api.get('/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always remove the token from localStorage
      localStorage.removeItem('authToken');
      return { success: true };
    }
  },
  
  // OAuth login helpers
  initiateGoogleLogin: () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/google`;
  },
  
  initiateFacebookLogin: () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/facebook`;
  }
};

// Menu items
export const menuAPI = {
  // Get all menu items with optional filters
  getAll: async (params?: {
    category?: string;
    minCalories?: number;
    maxCalories?: number;
    minProtein?: number;
    maxProtein?: number;
  }) => {
    const response = await api.get('/menu', { params });
    return response.data;
  },
  
  // Search menu items
  search: async (params: {
    query: string;
    category?: string;
    minCalories?: number;
    maxCalories?: number;
    minProtein?: number;
    maxProtein?: number;
    sort?: 'name' | 'price' | 'calories' | 'protein';
    order?: 'asc' | 'desc';
    limit?: number;
    page?: number;
  }) => {
    const response = await api.get('/menu/search', { params });
    return response.data;
  },
  
  // Get menu items by nutritional content
  getByNutrition: async (params: {
    minCalories?: number;
    maxCalories?: number;
    minProtein?: number;
    maxProtein?: number;
  }) => {
    const response = await api.get('/menu/nutrition', { params });
    return response.data;
  },
  
  // Get menu item by ID
  getById: async (id: string) => {
    const response = await api.get(`/menu/${id}`);
    return response.data;
  },
  
  // Create menu item (admin only)
  create: async (menuItem: Omit<MenuItem, '_id'>) => {
    const response = await api.post('/menu', menuItem);
    return response.data;
  },
  
  // Update menu item (admin only)
  update: async (id: string, menuItem: Partial<MenuItem>) => {
    const response = await api.put(`/menu/${id}`, menuItem);
    return response.data;
  },
  
  // Delete menu item (admin only)
  delete: async (id: string) => {
    const response = await api.delete(`/menu/${id}`);
    return response.data;
  }
};

// Orders
export const orderAPI = {
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
  cancel: async (id: string) => {
    const response = await api.patch(`/order/${id}/cancel`);
    return response.data;
  }
};

// Add subscription-related API methods
export const planAPI = {
  // Get all plans
  getAll: async () => {
    const response = await api.get('/plan');
    return response.data;
  },
  
  // Get plan by ID
  getById: async (id: string) => {
    const response = await api.get(`/plan/${id}`);
    return response.data;
  }
};

export const subscriptionAPI = {
  // Get available subscription plans
  getAvailablePlans: async () => {
    const response = await api.get('/subscription/plans');
    return response.data;
  },
  
  // Create a new subscription
  create: async (subscription: CreateSubscriptionDto) => {
    const response = await api.post('/subscription', subscription);
    return response.data;
  },
  
  // Get user's subscriptions
  getMySubscriptions: async () => {
    const response = await api.get('/subscription/my-subscriptions');
    return response.data;
  },
  
  // Get subscription by ID
  getById: async (id: string) => {
    const response = await api.get(`/subscription/${id}`);
    return response.data;
  },
  
  // Update subscription menu selections
  updateMenu: async (id: string, selectedMenuItems: Subscription['selectedMenuItems']) => {
    const response = await api.patch(`/subscription/${id}/menu`, { selectedMenuItems });
    return response.data;
  },
  
  // Cancel subscription
  cancel: async (id: string) => {
    const response = await api.patch(`/subscription/${id}/cancel`);
    return response.data;
  }
};

export default api; 
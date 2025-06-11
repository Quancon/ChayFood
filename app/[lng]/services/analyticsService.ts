import axios from 'axios';

// Forced debug logs
console.log('DEBUG: analyticsService is being imported');

// Types
export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  completedOrders: number;
  cancelledOrders: number;
  percentChange: {
    orders: number;
    revenue: number;
    aov: number;
  };
}

export interface CustomerStats {
  totalCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  percentChange: {
    total: number;
    new: number;
    repeat: number;
  };
}

export interface PopularDish {
  id: string;
  name: string;
  count: number;
  revenue: number;
}

export interface OrderTrend {
  date: string;
  orders: number;
  revenue: number;
}

export interface RegionalOrder {
  region: string;
  count: number;
  revenue: number;
}

// Cấu hình URL API từ biến môi trường hoặc mặc định
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
// const API_URL =  'http://localhost:5000';

// Log API URL for debugging
console.log('DEBUG: Analytics API URL:', API_URL);

// Debug flag - always enabled for troubleshooting
const DEBUG_MODE = true;

// Direct axios request for testing (bypassing interceptors)
const testApiConnection = async () => {
  try {
    console.log('DEBUG: Testing API connection...');
    const response = await axios.get(`${API_URL}/`, {
      timeout: 5000
    });
    console.log('DEBUG: API connection test successful:', response.status, response.statusText);
    return true;
  } catch (error: unknown) {
    console.error('DEBUG: API connection test failed:', error);
    return false;
  }
};

// Test API connection on module load
if (typeof window !== 'undefined') {
  testApiConnection();
}

// Helper function to get auth token
const getAuthHeader = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    console.log('Auth token available:', !!token);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
};

// Tạo instance axios với cấu hình chung
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 giây timeout
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    // Log request details
    console.log('DEBUG: API Request URL:', config.baseURL + (config.url || ''));
    console.log('DEBUG: API Request method:', config.method?.toUpperCase());
    console.log('DEBUG: API Request params:', config.params);
    console.log('DEBUG: API Request headers:', config.headers);
    
    // Ensure auth token is included
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('DEBUG: Added auth token to request headers');
      }
    }
    
    return config;
  },
  (error) => {
    console.error('DEBUG: Request setup error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('DEBUG: API Response status:', response.status, response.statusText);
    console.log('DEBUG: API Response data structure:', 
      Object.keys(response.data).length ? Object.keys(response.data) : 'Empty response');
    return response;
  },
  (error) => {
    // Log detailed error information
    console.error('DEBUG: API Error Response:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });
    
    // Authentication error handling
    if (error.response?.status === 401) {
      console.error('DEBUG: Authentication failed (401) - Token invalid or expired');
    } else if (error.response?.status === 403) {
      console.error('DEBUG: Authorization failed (403) - Not enough permissions');
    } else if (!error.response && error.code === 'ECONNREFUSED') {
      console.error('DEBUG: Connection refused - Server might be down');
    } else if (error.code === 'ECONNABORTED') {
      console.error('DEBUG: Request timeout - Server might be slow or down');
    }
    
    return Promise.reject(error);
  }
);

// Prepare filter parameters for API calls
interface FilterParams {
  timeRange?: string;
  region?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}

const prepareParams = (
  timeRange?: string,
  region?: string,
  category?: string,
  startDate?: string | null,
  endDate?: string | null
): FilterParams => {
  const params: FilterParams = {};
  
  if (timeRange) params.timeRange = timeRange;
  if (region && region !== 'all') params.region = region;
  if (category && category !== 'all') params.category = category;
  
  // Only include date parameters if both are provided and timeRange is 'custom'
  if (timeRange === 'custom' && startDate && endDate) {
    console.log('DEBUG: Adding custom date range parameters to request', { startDate, endDate });
    params.startDate = startDate;
    params.endDate = endDate;
  } else if (startDate && endDate) {
    console.log('DEBUG: Date parameters provided but timeRange is not custom, ignoring dates');
  }
  
  return params;
};

// Helper function to parse API response safely
const parseResponse = <T>(response: unknown): T => {
  console.log('DEBUG: Parsing API response');
  if (response && typeof response === 'object') {
    // Nếu response có property data
    if ('data' in response && response.data !== undefined) {
      console.log('DEBUG: Response contains wrapped data format');
      return (response as { data: T }).data;
    }
    // Nếu response là object đúng format
    console.log('DEBUG: Response contains direct data format');
    return response as T;
  }
  console.log('DEBUG: Unexpected response format, returning raw data');
  return response as T;
};

export const analyticsService = {
  // Get order statistics
  getOrderStats: async (
    timeRange?: string,
    region?: string,
    category?: string,
    startDate?: string | null,
    endDate?: string | null
  ): Promise<OrderStats> => {
    console.log('DEBUG: Fetching order statistics', { timeRange, region, category, startDate, endDate });
    
    const params = prepareParams(timeRange, region, category, startDate, endDate);
    
    try {
      const response = await apiClient.get('/analytics/orders/stats', {
        params,
        headers: getAuthHeader()
      });
      
      return parseResponse<OrderStats>(response);
    } catch (error: unknown) {
      console.error('Error fetching order statistics:', error);
      throw error;
    }
  },
  
  // Get customer statistics
  getCustomerStats: async (
    timeRange?: string,
    region?: string,
    startDate?: string | null,
    endDate?: string | null
  ): Promise<CustomerStats> => {
    console.log('DEBUG: Fetching customer statistics', { timeRange, region, startDate, endDate });
    
    const params = prepareParams(timeRange, region, undefined, startDate, endDate);
    
    try {
      const response = await apiClient.get('/analytics/customers/stats', {
        params,
        headers: getAuthHeader()
      });
      
      return parseResponse<CustomerStats>(response);
    } catch (error: unknown) {
      console.error('Error fetching customer statistics:', error);
      throw error;
    }
  },
  
  // Get popular dishes data
  getPopularDishes: async (
    timeRange?: string,
    region?: string,
    category?: string,
    startDate?: string | null,
    endDate?: string | null
  ): Promise<PopularDish[]> => {
    console.log('DEBUG: Fetching popular dishes', { timeRange, region, category, startDate, endDate });
    
    const params = prepareParams(timeRange, region, category, startDate, endDate);
    
    try {
      const response = await apiClient.get('/analytics/dishes/popular', {
        params,
        headers: getAuthHeader()
      });
      
      return parseResponse<PopularDish[]>(response);
    } catch (error: unknown) {
      console.error('Error fetching popular dishes:', error);
      throw error;
    }
  },
  
  // Get order trends data
  getOrderTrends: async (
    timeRange?: string,
    region?: string,
    category?: string,
    startDate?: string | null,
    endDate?: string | null
  ): Promise<OrderTrend[]> => {
    console.log('DEBUG: Fetching order trends', { timeRange, region, category, startDate, endDate });
    
    const params = prepareParams(timeRange, region, category, startDate, endDate);
    
    try {
      const response = await apiClient.get('/analytics/orders/trends', {
        params,
        headers: getAuthHeader()
      });
      
      return parseResponse<OrderTrend[]>(response);
    } catch (error: unknown) {
      console.error('Error fetching order trends:', error);
      throw error;
    }
  },
  
  // Get regional order data
  getRegionalOrders: async (
    timeRange?: string,
    category?: string,
    startDate?: string | null,
    endDate?: string | null
  ): Promise<RegionalOrder[]> => {
    console.log('DEBUG: Fetching regional orders', { timeRange, category, startDate, endDate });
    
    const params = prepareParams(timeRange, undefined, category, startDate, endDate);
    
    try {
      const response = await apiClient.get('/analytics/orders/regional', {
        params,
        headers: getAuthHeader()
      });
      
      return parseResponse<RegionalOrder[]>(response);
    } catch (error: unknown) {
      console.error('Error fetching regional orders:', error);
      throw error;
    }
  },
  
  // Enable or disable debug mode
  setDebugMode: (enabled: boolean) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('analyticsDebugMode', enabled ? 'true' : 'false');
      console.log(`Analytics debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }
  },
  
  // Check if debug mode is enabled
  isDebugMode: () => {
    return DEBUG_MODE || (typeof window !== 'undefined' && window.localStorage.getItem('analyticsDebugMode') === 'true');
  },
}; 
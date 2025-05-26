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
    // Log rõ ràng khi gọi login
    if (config.url?.includes('/auth/login')) {
      console.log('DEBUG LOGIN REQUEST:', {
        fullUrl: config.baseURL + config.url,
        method: config.method,
        data: config.data,
        headers: config.headers,
      });
    }
    // Get token from localStorage in client-side context
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        if (!config.url?.includes('/api/auth/status')) {
          console.log('API: Adding token to request:', config.url);
        }
        config.headers.Authorization = `Bearer ${token}`;
        
        if (!config.url?.includes('/api/auth/status')) {
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log(`API Request to ${config.url} - Token payload:`, {
                _id: payload._id,
                email: payload.email
              });
            }
          } catch (e) {
            console.error('API: Error parsing token in interceptor:', e);
          }
        }
      } else {
        if (!config.url?.includes('/api/auth/status')) {
          console.log('API: No token found for request:', config.url);
        }
      }
    }

    // Log request details
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data,
      headers: config.headers
    });

    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response logging
api.interceptors.response.use(
  (response) => {
    // Log response details
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
      params: response.config.params
    });
    return response;
  },
  (error) => {
    // Log error details
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      params: error.config?.params,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default api; 
import api from './apiClient';

export const authService = {
  // Biến lưu trữ thời gian gọi API cuối cùng
  _lastAuthCheck: 0,
  _isCheckingAuth: false,

  checkStatus: async () => {
    try {
      // Chống vòng lặp: Chỉ cho phép gọi API tối đa 1 lần trong 5 giây
      const now = Date.now();
      if (authService._isCheckingAuth || (now - authService._lastAuthCheck < 5000)) {
        if (localStorage.getItem('currentUser')) {
          try {
            const userData = JSON.parse(localStorage.getItem('currentUser') || '');
            return { isAuthenticated: true, user: userData };
          } catch (e) {
            // Không làm gì nếu parse lỗi
          }
        }
        return { isAuthenticated: !!localStorage.getItem('authToken'), user: null };
      }
      
      authService._isCheckingAuth = true;
      console.log('API: Checking auth status...');
      
      const response = await api.get('/auth/status');
      authService._lastAuthCheck = Date.now();
      authService._isCheckingAuth = false;
      
      if (response.data && response.data.isAuthenticated === true && response.data.user) {
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        return response.data;
      } else if (response.data && response.data.user) {
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        return {
          isAuthenticated: true,
          user: response.data.user
        };
      } else {
        if (response.data.isAuthenticated === false) {
          localStorage.removeItem('currentUser');
        }
        return response.data;
      }
    } catch (error) {
      console.error('checkStatus error:', error);
      authService._isCheckingAuth = false;
      return { isAuthenticated: false, user: null };
    }
  },
  
  login: async (email: string, password: string) => {
    try {
      console.log('API: Attempting to login with email/password');
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data && response.data.token) {
        console.log('API: Login successful, storing token');
        localStorage.setItem('authToken', response.data.token);
        
        if (response.data.user) {
          localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        }
        
        return true;
      } else {
        console.error('API: Login failed - no token in response');
        return false;
      }
    } catch (error) {
      console.error('API: Login error:', error);
      return false;
    }
  },
  
  loginWithToken: async (token: string) => {
    localStorage.setItem('authToken', token);
    return { success: true };
  },
  
  register: async (userData: { name: string; email: string; password: string }) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      await api.get('/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
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
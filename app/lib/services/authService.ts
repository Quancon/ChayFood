import api from './apiClient';

// Helper to set auth cookie
const setAuthCookie = (token: string) => {
  // Set cookie that will be accessible by server components
  if (typeof document !== 'undefined') {
    document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  }
};

export const authService = {
  // Client-side methods
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
            console.error('Error parsing currentUser:', e);
            return { isAuthenticated: false, user: null };
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
    } catch (error: unknown) {
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
        setAuthCookie(response.data.token);
        
        if (response.data.user) {
          localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        }
        
        return true;
      } else {
        console.error('API: Login failed - no token in response');
        return false;
      }
    } catch (error: unknown) {
      console.error('API: Login error:', error);
      return false;
    }
  },
  
  loginWithToken: async (token: string) => {
    localStorage.setItem('authToken', token);
    setAuthCookie(token);
    return { success: true };
  },
  
  register: async (userData: { name: string; email: string; password: string }) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        setAuthCookie(response.data.token);
      }
      return response.data;
    } catch (error: unknown) {
      console.error('Register error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      await api.get('/auth/logout');
    } catch (error: unknown) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('authToken');
      // Clear the auth cookie
      if (typeof document !== 'undefined') {
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      return { success: true };
    }
  },
  
  // Password reset functionality
  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return { 
        success: true, 
        message: response.data.message || 'Email đã được gửi với hướng dẫn đặt lại mật khẩu.'
      };
    } catch (error) {
      console.error('Error sending password reset email:', error);
     
    }
  },
  
  resetPassword: async (token: string, newPassword: string) => {
    try {
      const response = await api.post('/auth/reset-password', { 
        token, 
        newPassword 
      });
      return { 
        success: true, 
        message: response.data.message || 'Mật khẩu đã được đặt lại thành công.' 
      };
    } catch (error) {
      console.error('Error resetting password:', error);
   
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
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../lib/services';
import Cookies from 'js-cookie';

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (emailOrToken: string, password?: string) => Promise<User | null>;
  logout: () => Promise<void>;
  refreshAuthState: () => Promise<User | null>;
  forgotPassword: (email: string) => Promise<{success: boolean; message: string}>;
  resetPassword: (token: string, newPassword: string) => Promise<{success: boolean; message: string}>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefresh, setLastRefresh] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Helper function to update cookies with user data
  const updateCookies = (userData: User | null, token: string | null) => {
    if (userData) {
      // Store user data in cookie for middleware access (expires in 7 days)
      Cookies.set('currentUser', JSON.stringify(userData), { expires: 7, path: '/' });
      // Store auth token in cookie if provided
      if (token) {
        Cookies.set('authToken', token, { expires: 7, path: '/' });
        // Also set auth_token for API calls
        Cookies.set('auth_token', token, { expires: 7, path: '/' });
      }
    } else {
      // Remove cookies on logout
      Cookies.remove('currentUser', { path: '/' });
      Cookies.remove('authToken', { path: '/' });
      Cookies.remove('auth_token', { path: '/' });
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Check if token exists
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setUser(null);
          updateCookies(null, null);
          setIsLoading(false);
          return;
        }

        // Verify token with the API
        const response = await authService.checkStatus();
        
        if (response.user) {
          setUser(response.user);
          updateCookies(response.user, token);
        } else if (response.isAuthenticated === true) {
          // Try to decode the token to get user info
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              
              // Create minimal user from token payload
              const tokenUser = {
                _id: payload._id,
                email: payload.email,
                role: payload.role || 'user',
                name: payload.email.split('@')[0] // Use part of email as name if missing
              };
              
              setUser(tokenUser);
              updateCookies(tokenUser, token);
              
              // Store this user in localStorage for future use
              localStorage.setItem('currentUser', JSON.stringify(tokenUser));
            }
          } catch {
            setUser(null);
            updateCookies(null, null);
            localStorage.removeItem('authToken');
          }
        } else {
          setUser(null);
          updateCookies(null, null);
          localStorage.removeItem('authToken');
        }
      } catch {
        setUser(null);
        updateCookies(null, null);
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    setLastRefresh(Date.now());
  }, []);

  // Login function - now handles both token login (OAuth) and email/password login
  const login = async (emailOrToken: string, password?: string): Promise<User | null> => {
    setIsLoading(true);
    
    try {
      let success = false;
      
      // If password is provided, this is an email/password login
      if (password) {
        success = await authService.login(emailOrToken, password);
      } else {
        // This is a token login (from OAuth)
        const result = await authService.loginWithToken(emailOrToken);
        success = result.success;
      }
      
      if (!success) {
        return null;
      }
      
      // Đợi một thời gian ngắn để đảm bảo rằng token được lưu trữ
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        // Không tìm thấy trong cache, gọi API
        const response = await authService.checkStatus();
        
        if (response.user) {
          setUser(response.user);
          const token = localStorage.getItem('authToken');
          updateCookies(response.user, token);
          setIsLoading(false);
          return response.user;
        }
        
        // Nếu không có user trong response, nhưng có token, vẫn coi như đăng nhập thành công
        if (localStorage.getItem('authToken')) {
          return null;
        }
        
        return null;
      } catch (error) {
        console.error('Failed to get user info after login:', error);
        return null;
      }
    } catch (error) {
      console.error('Login error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh auth state
  const refreshAuthState = async (): Promise<User | null> => {
    // Chống vòng lặp và refresh quá nhanh
    const now = Date.now();
    if (isRefreshing || now - (lastRefresh || 0) < 5000) {
      return user;
    }
    
    setIsRefreshing(true);
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setUser(null);
        updateCookies(null, null);
        return null;
      }

      const response = await authService.checkStatus();
      
      if (response && response.user) {
        setUser(response.user);
        updateCookies(response.user, token);
        return response.user;
      } else if (response && response.isAuthenticated === true) {
        // Thử lấy thông tin từ token nếu không có user trong response
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const tokenUser = {
              _id: payload._id,
              email: payload.email,
              role: payload.role || 'user',
              name: payload.email.split('@')[0] // Use part of email as name if missing
            };
            setUser(tokenUser);
            updateCookies(tokenUser, token);
            localStorage.setItem('currentUser', JSON.stringify(tokenUser));
            return tokenUser;
          }
        } catch (e) {
          console.error('Failed to parse token during refresh', e);
        }
      } else {
        setUser(null);
        updateCookies(null, null);
        return null;
      }
      
      return null;
    } catch (error) {
      console.error('Refresh auth state error:', error);
      return null;
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setLastRefresh(Date.now());
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      updateCookies(null, null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    return await authService.forgotPassword(email);
  };

  // Reset password function
  const resetPassword = async (token: string, newPassword: string) => {
    return await authService.resetPassword(token, newPassword);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
    login,
    logout,
    refreshAuthState,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext; 
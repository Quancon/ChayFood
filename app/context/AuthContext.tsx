'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../lib/services';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Check if token exists
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Verify token with the API
        const response = await authService.checkStatus();
        
        if (response.user) {
          setUser(response.user);
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
              
              // Store this user in localStorage for future use
              localStorage.setItem('currentUser', JSON.stringify(tokenUser));
            }
          } catch (decodeError) {
            setUser(null);
            localStorage.removeItem('authToken');
          }
        } else {
          setUser(null);
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        setUser(null);
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
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
    if (isRefreshing || now - lastRefresh < 5000) {
      return user;
    }
    
    setIsRefreshing(true);
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setUser(null);
        return null;
      }

      const response = await authService.checkStatus();
      
      if (response && response.user) {
        setUser(response.user);
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
            localStorage.setItem('currentUser', JSON.stringify(tokenUser));
            return tokenUser;
          }
        } catch (e) {
          console.error('Failed to parse token during refresh', e);
        }
      } else {
        setUser(null);
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
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
    login,
    logout,
    refreshAuthState,
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
'use server';

import { cookies } from 'next/headers';

export type User = {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  picture?: string;
};

// Helper function to get auth token from cookies
async function getAuthTokenFromCookies() {
  const cookieStore = await cookies();
  
  // Check both cookie names for auth token
  let token = cookieStore.get('auth_token')?.value;
  if (!token) {
    token = cookieStore.get('authToken')?.value;
  }
  
  return token;
}

// Lấy thông tin người dùng hiện tại từ server component
export async function getCurrentUser() {
  try {
    const token = await getAuthTokenFromCookies();
    
    if (!token) {
      return null;
    }
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/auth/status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });

    const data = await response.json();
    
    if (data.isAuthenticated && data.user) {
      return data.user;
    }
    
    return null;
  } catch (error) {
    console.error('Lỗi lấy thông tin người dùng:', error);
    return null;
  }
}

// Đăng xuất từ server action
export async function logout() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    cookieStore.delete('authToken');
    return { success: true };
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    return { success: false };
  }
}

// Lưu token vào cookie từ server action
export async function setAuthToken(token: string) {
  try {
    const cookieStore = await cookies();
    // Set both cookie names for compatibility
    cookieStore.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });
    
    cookieStore.set({
      name: 'authToken',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });
    
    return { success: true };
  } catch (error) {
    console.error('Lỗi lưu token:', error);
    return { success: false };
  }
}

// Kiểm tra người dùng có là admin không
export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === 'admin';
} 
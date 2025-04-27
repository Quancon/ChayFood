'use server';

import { cookies } from 'next/headers';

export type User = {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  picture?: string;
};

// Lấy thông tin người dùng hiện tại từ server component
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
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
    cookieStore.set({
      name: 'auth_token',
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
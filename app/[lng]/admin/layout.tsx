'use client'

import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../../components/auth/AuthModal';

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Kiểm tra xác thực khi component mount
  useEffect(() => {
    // Nếu đã load xong và không có xác thực hoặc không phải admin, hiển thị form đăng nhập
    if (!isLoading && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated, isLoading]);

  // Chuyển hướng về trang chủ nếu không phải admin
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  // Khi đang loading, hiển thị loading indicator
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  // Nếu chưa xác thực, hiển thị trang đăng nhập
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Admin Login</h1>
          <p className="mb-6 text-center text-gray-600">
            Bạn cần đăng nhập với quyền admin để truy cập trang này
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full rounded-md bg-green-500 py-2 px-4 text-white hover:bg-green-600"
          >
            Đăng nhập
          </button>
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialView="signin" />
        </div>
      </div>
    );
  }

  // Nếu đã xác thực và là admin, hiển thị layout admin
  return (
    <>
      {/* CSS to hide navbar and footer in admin section */}
      <style jsx global>{`
        /* Remove top padding from main content in admin area */
        main.pt-20 {
          padding-top: 0 !important;
        }
        
        /* Hide the main site header and footer in admin section */
        body > div > header,
        body > div > footer {
          display: none !important;
        }
      `}</style>
      
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </>
  );
} 
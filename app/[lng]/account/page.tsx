'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function AccountPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      router.push('/account/profile');
    }
  }, [router]);

  // Redirect to login if not authenticated
  // if (!isAuthenticated) {
  //   router.push('/login');
  //   return null;
  // }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    router.push('/');
  };

  // Account dashboard cards
  const dashboardCards = [
    {
      title: 'My Orders',
      description: 'View your order history and track current orders',
      icon: (
        <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
        </svg>
      ),
      link: '/account/orders',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Personal Info',
      description: 'Update your personal information and preferences',
      icon: (
        <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      ),
      link: '/account/profile',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Addresses',
      description: 'Manage your delivery addresses',
      icon: (
        <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      ),
      link: '/account/addresses',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Payment Methods',
      description: 'Manage your payment methods',
      icon: (
        <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
        </svg>
      ),
      link: '/account/payment',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">My Account</h1>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 ${
            isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoggingOut ? 'Logging out...' : 'Log Out'}
        </button>
      </div>
      
      {/* User info card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center">
          <div className="bg-green-500 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold">
            {/* Xóa mọi chỗ sử dụng biến 'user' vì đã xóa khỏi destructure useAuth */}
          </div>
          <div className="ml-6">
            <h2 className="text-xl font-semibold">User</h2>
            <p className="text-gray-600">user@example.com</p>
          </div>
        </div>
      </div>
      
      {/* Dashboard grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => (
          <Link 
            key={index}
            href={card.link}
            className={`${card.bgColor} border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow`}
          >
            <div className="mb-4">
              {card.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
            <p className="text-gray-600 text-sm">{card.description}</p>
          </Link>
        ))}
      </div>
      
      {/* Recent Orders Preview - Optional */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Recent Orders</h2>
          <Link href="/account/orders" className="text-green-600 hover:text-green-800">
            View All Orders
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* This would typically fetch and display recent orders */}
          <p className="text-gray-600 text-center py-8">
            Your recent orders will appear here.
            <br />
            <Link href="/menu" className="text-green-600 hover:text-green-800 font-medium block mt-4">
              Browse Menu & Order Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  Cog8ToothIcon,
  HomeIcon,
  UsersIcon,
  ShoppingBagIcon,
  BanknotesIcon,
  TagIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../[lng]/context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Orders', href: '/admin/orders', icon: ClipboardDocumentListIcon },
  { name: 'Menu', href: '/admin/menu', icon: ShoppingBagIcon },
  { name: 'Promotions', href: '/admin/promotions', icon: TagIcon },
  { name: 'Customers', href: '/admin/customers', icon: UsersIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Revenue', href: '/admin/revenue', icon: BanknotesIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog8ToothIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/'; // Redirect to homepage after logout
  };

  return (
    <div className={`bg-[#1F2937] text-white transition-all duration-300 flex flex-col h-screen ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 flex justify-between items-center">
        {!collapsed && <div className="text-xl font-bold">ChayFood Admin</div>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-gray-700"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
      <nav className="mt-5 px-2 flex-grow">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1`}
            >
              <item.icon
                className={`${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                } mr-3 flex-shrink-0 h-6 w-6 ${collapsed ? 'mx-auto' : ''}`}
                aria-hidden="true"
              />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      
      {/* Logout button */}
      <div className="px-2 pb-4 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md"
        >
          <ArrowRightOnRectangleIcon
            className={`text-gray-400 group-hover:text-white mr-3 flex-shrink-0 h-6 w-6 ${collapsed ? 'mx-auto' : ''}`}
            aria-hidden="true"
          />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </div>
  );
} 
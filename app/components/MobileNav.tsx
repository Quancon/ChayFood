"use client"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bars3Icon, XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../context/AuthContext'
import AuthModal from './auth/AuthModal'

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface MobileNavProps {
  isAuthenticated?: boolean;
  user?: User | null;
  cartItemCount?: number;
  onSignIn?: () => void;
  onSignUp?: () => void;
  onLogout?: () => Promise<void>;
}

export default function MobileNav({
  isAuthenticated: propsIsAuthenticated,
  user: propsUser,
  cartItemCount: propsCartItemCount,
  onSignIn: propsOnSignIn,
  onSignUp: propsOnSignUp,
  onLogout: propsOnLogout
}: MobileNavProps = {}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems } = useCart();
  const { isAuthenticated: authIsAuthenticated, user: authUser, logout: authLogout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalView, setAuthModalView] = useState<'signin' | 'signup'>('signin');

  // Use props if provided, otherwise fall back to context values
  const isAuthenticated = propsIsAuthenticated !== undefined ? propsIsAuthenticated : authIsAuthenticated;
  const user = propsUser || authUser;
  const totalCartItems = propsCartItemCount !== undefined ? propsCartItemCount : totalItems;
  const logout = propsOnLogout || authLogout;
  
  const isAdmin = user?.role === 'admin';

  const regularMenuItems = [
    { href: '/', label: 'Trang chủ' },
    { href: '/menu', label: 'Thực đơn' },
    { href: '/party', label: 'Đặt tiệc' },
    { href: '/subscriptions', label: 'Đăng ký gói' },
    { href: '/about', label: 'Giới thiệu' },
  ];
  
  const adminMenuItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/orders', label: 'Manage Orders' },
    { href: '/admin/menu', label: 'Manage Menu' },
    { href: '/admin/users', label: 'Manage Users' },
  ];
  
  const menuItems = isAdmin ? adminMenuItems : regularMenuItems;

  const openSignIn = () => {
    setIsOpen(false);
    if (propsOnSignIn) {
      propsOnSignIn();
    } else {
      setAuthModalView('signin');
      setShowAuthModal(true);
    }
  }
  
  const openSignUp = () => {
    setIsOpen(false);
    if (propsOnSignUp) {
      propsOnSignUp();
    } else {
      setAuthModalView('signup');
      setShowAuthModal(true);
    }
  }

  return (
    <>
      <div className="md:hidden">
        <div className="flex items-center">
          {/* Only show cart for regular users */}
          {!isAdmin && (
            <Link
              href="/cart"
              className="relative p-2 mr-2 text-gray-700"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {totalCartItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-green-500 rounded-full">
                  {totalCartItems}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            {isOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-16 left-0 right-0 bg-white shadow-lg z-50"
            >
              <div className="px-4 py-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block py-2 ${pathname === item.href ? 'text-green-600 font-medium' : 'text-gray-700'} hover:text-green-600`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-gray-200 mt-2 pt-2">
                  {isAuthenticated ? (
                    <>
                      {!isAdmin && (
                        <>
                          <Link
                            href="/account/profile"
                            className="block py-2 text-gray-700 hover:text-green-600"
                            onClick={() => setIsOpen(false)}
                          >
                            Profile
                          </Link>
                          <Link
                            href="/account/orders"
                            className="block py-2 text-gray-700 hover:text-green-600"
                            onClick={() => setIsOpen(false)}
                          >
                            My Orders
                          </Link>
                          <Link
                            href="/account/subscriptions"
                            className="block py-2 text-gray-700 hover:text-green-600"
                            onClick={() => setIsOpen(false)}
                          >
                            My Subscriptions
                          </Link>
                        </>
                      )}
                      
                      <div className="border-t border-gray-100 my-2"></div>
                      <button
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                        className="block w-full text-left py-2 text-gray-700 hover:text-red-600"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="block py-2 text-gray-700 hover:text-green-600 w-full text-left"
                        onClick={openSignIn}
                      >
                        Sign In
                      </button>
                      <button
                        className="block py-2 text-green-600 font-semibold hover:text-green-700 w-full text-left"
                        onClick={openSignUp}
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Auth Modal - Only render if we're not using props for authentication */}
      {!propsOnSignIn && !propsOnSignUp && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          initialView={authModalView} 
        />
      )}
    </>
  )
} 
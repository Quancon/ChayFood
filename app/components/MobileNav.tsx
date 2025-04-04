"use client"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bars3Icon, XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../context/AuthContext'
import AuthModal from './auth/AuthModal'

export default function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalView, setAuthModalView] = useState<'signin' | 'signup'>('signin');

  const menuItems = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
    { href: '/order', label: 'Order Now' },
    { href: '/subscriptions', label: 'Meal Plans' },
    { href: '/about', label: 'About Us' },
  ]

  const openSignIn = () => {
    setIsOpen(false);
    setAuthModalView('signin');
    setShowAuthModal(true);
  }
  
  const openSignUp = () => {
    setIsOpen(false);
    setAuthModalView('signup');
    setShowAuthModal(true);
  }

  return (
    <>
      <div className="md:hidden">
        <div className="flex items-center">
          <Link
            href="/cart"
            className="relative p-2 mr-2 text-gray-700"
          >
            <ShoppingCartIcon className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-green-500 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
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
                      <button
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                        className="block w-full text-left py-2 text-red-600 font-medium hover:text-red-700"
                      >
                        Sign Out
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
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialView={authModalView} 
      />
    </>
  )
} 
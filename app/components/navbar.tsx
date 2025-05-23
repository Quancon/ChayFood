"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../context/AuthContext'
import MobileNav from './MobileNav'
import AuthModal from './auth/AuthModal'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

const NavLink = ({ href, children, className = '' }: NavLinkProps) => {
  const pathname = usePathname()
  const isActive = pathname === href
  
  return (
    <Link
      href={href}
      className={`${className} ${
        isActive 
          ? 'text-green-600 font-medium' 
          : 'text-gray-700 hover:text-green-600'
      } transition-colors`}
    >
      {children}
    </Link>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  
  // Hide navbar completely on admin pages
  if (pathname?.startsWith('/admin')) {
    return null
  }
  
  const [scrolled, setScrolled] = useState(false)
  const { totalItems } = useCart()
  const { isAuthenticated, user, logout, isLoading, refreshAuthState } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalView, setAuthModalView] = useState<'signin' | 'signup'>('signin')
  const [lastRefresh, setLastRefresh] = useState(Date.now())
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const isAdmin = user?.role === 'admin'
  
  // Try refreshing auth state on mount if we have a token but no user
  useEffect(() => {
    const checkAuthState = async () => {
      // Kiểm tra nếu đang refresh, hoặc đã refresh gần đây, tránh lặp vô hạn
      const now = Date.now();
      if (isRefreshing || now - lastRefresh < 5000) {
        return;
      }
      
      const token = localStorage.getItem('authToken');
      const shouldRefresh = token && !isAuthenticated && !isLoading;
      
      if (shouldRefresh) {
        setIsRefreshing(true);
        await refreshAuthState();
        setLastRefresh(Date.now());
        setIsRefreshing(false);
      }
    };
    
    checkAuthState();
  }, [isAuthenticated, isLoading, refreshAuthState, lastRefresh, isRefreshing]);
  
  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false)
    }
    
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showUserMenu])
  
  const openSignIn = () => {
    setAuthModalView('signin')
    setShowAuthModal(true)
  }
  
  const openSignUp = () => {
    setAuthModalView('signup')
    setShowAuthModal(true)
  }
  
  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-md py-2' : 'bg-white/80 backdrop-blur-sm py-4'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-green-600">ChayFood</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {isAdmin ? (
                <>
                  <NavLink href="/admin/dashboard">Dashboard</NavLink>
                  <NavLink href="/admin/orders">Manage Orders</NavLink>
                  <NavLink href="/admin/menu">Manage Menu</NavLink>
                  <NavLink href="/admin/users">Manage Users</NavLink>
                </>
              ) : (
                <>
                  <NavLink href="/">Trang chủ</NavLink>
                  <NavLink href="/menu">Thực đơn</NavLink>
                  <NavLink href="/order">Đặt hàng</NavLink>
                  <NavLink href="/subscriptions">Đăng ký gói</NavLink>
                  <NavLink href="/about">Giới thiệu</NavLink>
                </>
              )}
            </nav>
            
            {/* Right side buttons - desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Cart button - only show for regular users */}
              {!isAdmin && (
                <Link
                  href="/cart"
                  className="relative p-2 text-gray-700 hover:text-green-600 transition-colors"
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-green-500 rounded-full">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}
              
              {/* User account */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowUserMenu(!showUserMenu)
                    }}
                    className="flex items-center text-gray-700 hover:text-green-600"
                  >
                    <UserIcon className="h-6 w-6" />
                    <span className="ml-2">{user?.name?.split(' ')[0] || 'Account'}</span>
                  </button>
                  
                  {/* Dropdown menu */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isAdmin ? (
                          // Admin menu items
                          <>
                            <Link
                              href="/admin/dashboard"
                              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                              onClick={() => setShowUserMenu(false)}
                            >
                              Dashboard
                            </Link>
                            <Link
                              href="/admin/orders"
                              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                              onClick={() => setShowUserMenu(false)}
                            >
                              Manage Orders
                            </Link>
                            <Link
                              href="/admin/menu"
                              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                              onClick={() => setShowUserMenu(false)}
                            >
                              Manage Menu
                            </Link>
                            <Link
                              href="/admin/users"
                              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                              onClick={() => setShowUserMenu(false)}
                            >
                              Manage Users
                            </Link>
                          </>
                        ) : (
                          // Regular user menu items
                          <>
                            <Link
                              href="/account/profile"
                              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                              onClick={() => setShowUserMenu(false)}
                            >
                              Profile
                            </Link>
                            <Link
                              href="/account/orders"
                              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                              onClick={() => setShowUserMenu(false)}
                            >
                              My Orders
                            </Link>
                            <Link
                              href="/account/subscriptions"
                              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                              onClick={() => setShowUserMenu(false)}
                            >
                              My Subscriptions
                            </Link>
                          </>
                        )}
                        
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            logout()
                          }}
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={openSignIn}
                    className="text-gray-700 hover:text-green-600 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={openSignUp}
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
            
            {/* Hamburger Menu - Mobile */}
            <div className="md:hidden">
              <MobileNav 
                isAuthenticated={isAuthenticated}
                user={user}
                cartItemCount={totalItems}
                onSignIn={openSignIn}
                onSignUp={openSignUp}
                onLogout={async () => {
                  await logout();
                }}
              />
            </div>
          </div>
        </div>
      </header>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialView={authModalView} 
      />
    </>
  )
} 
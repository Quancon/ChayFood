"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { UserIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/[lng]/(default)/hooks/useCart'
import { useAuth } from '@/[lng]/(default)/context/AuthContext'
import MobileNav from './MobileNav'
import AuthModal from './auth/AuthModal'
import LanguageChanger from './LanguageChanger'
import { useTranslation } from 'react-i18next'

export default function Navbar({ lng }: { lng: string }) {
  const { t } = useTranslation()
  const navLinks = [
    { href: `/${lng}`, label: t('nav.home') },
    { href: `/${lng}/menu`, label: t('nav.menu') },
    { href: `/${lng}/subscriptions`, label: t('nav.subscriptions') },
    { href: `/${lng}/about`, label: t('nav.about') },
  ]

  const pathname = usePathname()
  const { user, isAuthenticated, logout, isLoading, refreshAuthState } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const { totalItems } = useCart()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalView, setAuthModalView] = useState<'signin' | 'signup'>('signin')
  const [lastRefresh, setLastRefresh] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Always call hooks first, then conditionally render
  useEffect(() => {
    const checkAuthState = async () => {
      // Kiểm tra nếu đang refresh, hoặc đã refresh gần đây, tránh lặp vô hạn
      const now = Date.now();
      if (isRefreshing || now - (lastRefresh ?? 0) < 5000) {
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
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
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
  
  if (pathname?.startsWith(`/${lng}/admin`)) {
    return null
  }
  
  const openSignIn = () => {
    setAuthModalView('signin')
    setShowAuthModal(true)
  }
  
  const openSignUp = () => {
    setAuthModalView('signup')
    setShowAuthModal(true)
  }

  // Check if current path is active considering lng parameter
  const isActivePath = (href: string) => {
    if (href === `/${lng}` && pathname === `/${lng}`) {
      return true;
    }
    return pathname?.startsWith(href);
  };
  
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
            <Link href={`/${lng}`} className="flex items-center">
              <span className="text-xl font-bold text-green-600">ChayFood</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors ${
                    isActivePath(link.href)
                      ? 'text-green-600 font-medium'
                      : 'text-gray-700 hover:text-green-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            
            {/* Right side buttons - desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Language Changer */}
              <LanguageChanger />

              {/* Cart button */}
              <Link
                href={`/${lng}/cart`}
                className="relative p-2 text-gray-700 hover:text-green-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.48 19h9.04a2 2 0 001.83-1.3L17 13M7 13V6h10v7"
                  />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-green-500 rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>
              
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
                    <span className="ml-2">{user?.name?.split(' ')[0] || t('nav.account')}</span>
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
                        <Link
                          href={`/${lng}/account/profile`}
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          {t('nav.profile')}
                        </Link>
                        <Link
                          href={`/${lng}/account/orders`}
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          {t('nav.myOrders')}
                        </Link>
                        <Link
                          href={`/${lng}/account/subscriptions`}
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          {t('nav.mySubscriptions')}
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            logout()
                          }}
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          {t('nav.logout')}
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
                    {t('nav.signIn')}
                  </button>
                  <button
                    onClick={openSignUp}
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors"
                  >
                    {t('nav.signUp')}
                  </button>
                </div>
              )}
            </div>
            
            {/* Hamburger Menu - Mobile */}
            <div className="md:hidden">
              <MobileNav 
                lng={lng}
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
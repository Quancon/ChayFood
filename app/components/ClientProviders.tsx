'use client'

import { AuthProvider } from '../[lng]/context/AuthContext'
import { CartProvider } from '../[lng]/context/CartContext'
import { Toaster } from 'react-hot-toast'
import { ReactNode } from 'react'
import CartNotificationProvider from './CartNotificationProvider'
import dynamic from 'next/dynamic'

// Import CartDebug component dynamically with no SSR to avoid hydration issues
const CartDebug = dynamic(() => import('./CartDebug'), { ssr: false })

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <CartNotificationProvider>
          {children}
          <Toaster position="top-center" />
          <CartDebug />
        </CartNotificationProvider>
      </CartProvider>
    </AuthProvider>
  )
} 
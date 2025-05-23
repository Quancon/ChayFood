'use client'

import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import { Toaster } from 'react-hot-toast'
import { ReactNode } from 'react'
import CartNotificationProvider from './CartNotificationProvider'

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <CartNotificationProvider>
          {children}
          <Toaster position="top-center" />
        </CartNotificationProvider>
      </CartProvider>
    </AuthProvider>
  )
} 
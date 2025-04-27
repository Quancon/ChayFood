'use client'

import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import { Toaster } from 'react-hot-toast'
import { ReactNode } from 'react'

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <Toaster position="top-center" />
      </CartProvider>
    </AuthProvider>
  )
} 
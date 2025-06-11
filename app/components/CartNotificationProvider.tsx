'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import CartToast from './cart-toast';
import { useCart } from '../[lng]/hooks/useCart';

export default function CartNotificationProvider({ children }: { children: React.ReactNode }) {
  const { message, hasMessage, dismissMessage } = useCart();
  const [internalMessage, setInternalMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const pathname = usePathname();

  // Reset message when navigating between pages
  useEffect(() => {
    dismissMessage();
  }, [pathname, dismissMessage]);

  // Sync message from cart context
  useEffect(() => {
    if (hasMessage && message) {
      console.log("Message from useCart:", message);
      setInternalMessage(message);
      
      // Check if message contains common error keywords
      const isErrorMsg = 
        message.toLowerCase().includes('error') || 
        message.toLowerCase().includes('failed') || 
        message.toLowerCase().includes('vui lòng đăng nhập') ||
        message.toLowerCase().includes('không thể');
      
      setIsError(isErrorMsg);
      console.log("Message processed:", { message, isError: isErrorMsg });
    } else {
      setInternalMessage(null);
    }
  }, [hasMessage, message]);

  return (
    <>
      {children}
      {internalMessage && (
        <CartToast 
          message={internalMessage} 
          isError={isError}
          onDismiss={dismissMessage} 
          duration={5000}
        />
      )}
    </>
  );
} 
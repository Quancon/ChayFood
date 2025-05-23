'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface CartToastProps {
  message: string;
  isError?: boolean;
  onDismiss: () => void;
  duration?: number; // in milliseconds
}

export function CartToast({ message, isError = false, onDismiss, duration = 3000 }: CartToastProps) {
  useEffect(() => {
    console.log("CartToast mounted with message:", message);
    if (message) {
      const timer = setTimeout(() => {
        console.log("CartToast auto-dismissing after timeout");
        onDismiss();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [message, onDismiss, duration]);

  const Icon = isError ? ExclamationCircleIcon : CheckCircleIcon;
  const bgColor = isError ? 'bg-red-600' : 'bg-green-600';

  // Add debug log when rendering
  console.log("CartToast rendering:", { message, isError });

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-20 right-4 z-50 max-w-xs"
        >
          <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2`}>
            <Icon className="w-5 h-5" />
            <span>{message}</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                console.log("CartToast dismiss button clicked");
                onDismiss();
              }}
              className="ml-2 text-white opacity-80 hover:opacity-100 transition-opacity"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CartToast; 
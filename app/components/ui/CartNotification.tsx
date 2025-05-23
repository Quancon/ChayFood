import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CartNotificationProps {
  message: string | null;
  isError?: boolean;
  onDismiss: () => void;
}

export default function CartNotification({ message, isError = false, onDismiss }: CartNotificationProps) {
  if (!message) return null;
  
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 max-w-xs ${
            isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}
        >
          <span className="flex-1">{message}</span>
          <button onClick={onDismiss} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 
"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import SignInForm from './SignInForm'
import SignUpForm from './SignUpForm'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialView?: 'signin' | 'signup'
}

export default function AuthModal({ isOpen, onClose, initialView = 'signin' }: AuthModalProps) {
  const [view, setView] = useState<'signin' | 'signup'>(initialView)
  
  // Reset to initial view when modal is opened
  useEffect(() => {
    if (isOpen) {
      setView(initialView)
    }
  }, [isOpen, initialView])
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    if (isOpen) {
      window.addEventListener('keydown', handleEscKey)
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen, onClose])
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-[95%] max-w-md bg-white rounded-xl shadow-2xl overflow-hidden mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-6 pb-0">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
                
                <div className="flex space-x-4 border-b border-gray-200">
                  <button
                    onClick={() => setView('signin')}
                    className={`pb-3 px-2 -mb-px transition-colors ${
                      view === 'signin'
                        ? 'border-b-2 border-green-500 text-green-600 font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Sign In
                  </button>
                  
                  <button
                    onClick={() => setView('signup')}
                    className={`pb-3 px-2 -mb-px transition-colors ${
                      view === 'signup'
                        ? 'border-b-2 border-green-500 text-green-600 font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
              
              {/* Body */}
              <div className="p-6">
                {view === 'signin' ? (
                  <SignInForm onSuccess={onClose} onSignUpClick={() => setView('signup')} />
                ) : (
                  <SignUpForm onSuccess={onClose} onSignInClick={() => setView('signin')} />
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 
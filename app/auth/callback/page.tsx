"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import Link from 'next/link'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshAuthState } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error parameter first
        const errorParam = searchParams.get('error')
        if (errorParam) {
          console.error(`Auth error: ${errorParam}`);
          if (errorParam === 'authentication_failed') {
            setError('Authentication failed. Please try again with a different method.')
          } else if (errorParam === 'server_error') {
            setError('Server error occurred during authentication. Please try again later.')
          } else {
            setError(`Authentication error: ${errorParam}`)
          }
          setIsLoading(false)
          return
        }
        
        // Get token from URL
        const token = searchParams.get('token')
        if (!token) {
          console.error('No token found in callback URL');
          setError('Authentication failed: No token received')
          setIsLoading(false)
          return
        }

        // Store token in localStorage
        localStorage.setItem('authToken', token);
        
        // Try to refresh auth state to get user info
        let isAdmin = false
        try {
          const user = await refreshAuthState();
          isAdmin = user?.role === 'admin'
        } catch (refreshError) {
          console.error('Error refreshing auth state:', refreshError);
          // We continue even if this fails - the token is already stored
        }
        
        // Redirect admin users directly to dashboard, regular users to saved path or home
        const redirectPath = isAdmin 
          ? '/admin/dashboard' 
          : (localStorage.getItem('redirectAfterAuth') || '/')
        
        localStorage.removeItem('redirectAfterAuth')
        
        // Small delay to ensure token is saved
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Hard refresh to the appropriate page
        window.location.href = redirectPath;
      } catch (err) {
        console.error('Auth callback error:', err)
        setError('Failed to authenticate. Please try again.')
        setIsLoading(false)
      }
    }

    handleCallback()
  }, [searchParams, refreshAuthState]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-t-4 border-green-500 border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-gray-700">Processing your login...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="flex flex-col space-y-3">
            <Link
              href="/"
              className="w-full py-2 px-4 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition-colors text-center"
            >
              Go to Homepage
            </Link>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 border-t-4 border-green-500 border-solid rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-gray-700">Redirecting you...</p>
    </div>
  )
} 
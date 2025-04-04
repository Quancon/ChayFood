"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token')
        
        if (!token) {
          setError('Authentication failed: No token received')
          return
        }

        // Login with the received token
        await login(token)
        
        // Redirect to home page or dashboard after successful authentication
        const redirectTo = searchParams.get('redirectTo') || '/'
        router.push(redirectTo)
      } catch (err) {
        console.error('Auth callback error:', err)
        setError('Failed to authenticate. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    handleCallback()
  }, [searchParams, login, router])

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
          <button
            onClick={() => router.push('/login')}
            className="w-full py-2 px-4 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition-colors"
          >
            Return to Login
          </button>
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
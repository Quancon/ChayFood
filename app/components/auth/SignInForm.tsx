"use client"

import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { 
  GoogleIcon, 
  FacebookIcon 
} from '../ui/social-icons'
import { authAPI } from '../../lib/api'

interface SignInFormProps {
  onSuccess: () => void
  onSignUpClick: () => void
}

type FormData = {
  email: string
  password: string
  rememberMe: boolean
}

export default function SignInForm({ onSuccess, onSignUpClick }: SignInFormProps) {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  })
  
  const onSubmit = async (data: FormData) => {
    setError('')
    setIsLoading(true)
    
    try {
      // First call the login API endpoint to get a token
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/login`,
        {
          email: data.email,
          password: data.password
        }
      )
      
      // Then pass the token to our login function
      if (response.data && response.data.token) {
        await login(response.data.token)
        onSuccess()
      } else {
        setError('Invalid response from server')
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || 'Invalid credentials')
      } else if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to sign in. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setIsLoading(true)
    setError('')
    
    try {
      // Use the authAPI methods for OAuth login
      if (provider === 'google') {
        authAPI.initiateGoogleLogin()
      } else if (provider === 'facebook') {
        authAPI.initiateFacebookLogin()
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(`Failed to sign in with ${provider}. Please try again.`)
      }
      setIsLoading(false)
    }
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Welcome Back</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {/* OAuth providers */}
      <div className="space-y-3 mb-6">
        <button
          type="button"
          onClick={() => handleOAuthLogin('google')}
          disabled={isLoading}
          className="flex items-center justify-center w-full py-2.5 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <GoogleIcon className="h-5 w-5 mr-2" />
          <span>Continue with Google</span>
        </button>
        
        <button
          type="button"
          onClick={() => handleOAuthLogin('facebook')}
          disabled={isLoading}
          className="flex items-center justify-center w-full py-2.5 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <FacebookIcon className="h-5 w-5 mr-2" />
          <span>Continue with Facebook</span>
        </button>
      </div>
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="your@email.com"
            className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            disabled={isLoading}
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            disabled={isLoading}
            {...register('password', { 
              required: 'Password is required'
            })}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-300 rounded"
              disabled={isLoading}
              {...register('rememberMe')}
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          
          <button
            type="button"
            className="text-sm text-green-600 hover:text-green-700"
            disabled={isLoading}
          >
            Forgot password?
          </button>
        </div>
        
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isLoading
              ? 'bg-green-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600'
          } transition-colors`}
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSignUpClick}
            className="text-green-600 hover:text-green-700 font-medium"
            disabled={isLoading}
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  )
} 
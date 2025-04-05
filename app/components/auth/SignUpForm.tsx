"use client"

import { useState } from 'react'

import axios from 'axios'
import { useForm } from 'react-hook-form'
import { authService } from '../../lib/services'

interface SignUpFormProps {
  onSuccess: () => void
  onSignInClick: () => void
}

type FormData = {
  name: string
  email: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

export default function SignUpForm({ onSuccess, onSignInClick }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    }
  })
  
  // For password confirmation validation
  const password = watch('password')
  
  const onSubmit = async (data: FormData) => {
    setError('')
    setIsLoading(true)
    
    try {
      // Use the authAPI register method
      const response = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password
      })
      
      // If registration is successful, the token is already saved by the API method
      if (response.user) {
        onSuccess()
      } else {
        setError('Registration successful, but unable to log in automatically')
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || 'Registration failed')
      } else if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to sign up. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md text-sm">
          {error}
        </div>
      )}
      
  
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="John Doe"
            className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            disabled={isLoading}
            {...register('name', { 
              required: 'Full name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters'
              }
            })}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>
        
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
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
                message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
              }
            })}
          />
          {errors.password ? (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters with uppercase, lowercase, number and special character</p>
          )}
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            className={`w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            disabled={isLoading}
            {...register('confirmPassword', { 
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match'
            })}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>
        
        <div className="flex items-center">
          <input
            id="agreeToTerms"
            type="checkbox"
            className={`h-4 w-4 text-green-500 focus:ring-green-500 border-gray-300 rounded ${errors.agreeToTerms ? 'border-red-500 ring-1 ring-red-500' : ''}`}
            disabled={isLoading}
            {...register('agreeToTerms', { 
              required: 'You must agree to the terms and conditions'
            })}
          />
          <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
            I agree to the{' '}
            <a href="/terms" className="text-green-600 hover:text-green-700" target="_blank">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-green-600 hover:text-green-700" target="_blank">
              Privacy Policy
            </a>
          </label>
        </div>
        {errors.agreeToTerms && (
          <p className="mt-1 text-xs text-red-500">{errors.agreeToTerms.message}</p>
        )}
        
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isLoading
              ? 'bg-green-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600'
          } transition-colors`}
          disabled={isLoading}
        >
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => {
              const event = new CustomEvent('switchAuthView', { detail: 'signin' });
              window.dispatchEvent(event);
            }}
            className="text-green-600 hover:text-green-700 font-medium"
            disabled={isLoading}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  )
} 
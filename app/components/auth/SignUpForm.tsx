"use client"

import { useState } from 'react'

import axios from 'axios'
import { useForm } from 'react-hook-form'
import { authService } from '@/lib/services'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'

interface SignUpFormProps {
  onSuccess: () => void
  lng: string
  onSignInClick?: () => void
}

type FormData = {
  name: string
  email: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

export default function SignUpForm({ onSuccess, lng }: SignUpFormProps) {
  const { t } = useTranslation()
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
  // const login = watch('password')
  
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
        setError(t('signUpForm.registrationSuccessful'))
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || t('signUpForm.registrationFailed'))
      } else if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(t('signUpForm.failedToSignUp'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">{t('signUpForm.createAccount')}</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md text-sm">
          {error}
        </div>
      )}
      
  
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            {t('signUpForm.fullNameLabel')}
          </label>
          <input
            id="name"
            type="text"
            placeholder={t('signUpForm.fullNamePlaceholder')}
            className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            disabled={isLoading}
            {...register('name', { 
              required: t('signUpForm.fullNameRequired'),
              minLength: {
                value: 2,
                message: t('signUpForm.fullNameMinLength')
              }
            })}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {t('signUpForm.emailLabel')}
          </label>
          <input
            id="email"
            type="email"
            placeholder={t('signUpForm.emailPlaceholder')}
            className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            disabled={isLoading}
            {...register('email', { 
              required: t('signUpForm.emailRequired'),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t('signUpForm.invalidEmail')
              }
            })}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            {t('signUpForm.passwordLabel')}
          </label>
          <input
            id="password"
            type="password"
            placeholder={t('signUpForm.passwordPlaceholder')}
            className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            disabled={isLoading}
            {...register('password', { 
              required: t('signUpForm.passwordRequired'),
              minLength: {
                value: 6,
                message: t('signUpForm.passwordMinLength')
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
                message: t('signUpForm.passwordRequirements')
              }
            })}
          />
          {errors.password ? (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">{t('signUpForm.passwordRequirements')}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            {t('signUpForm.confirmPasswordLabel')}
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder={t('signUpForm.confirmPasswordPlaceholder')}
            className={`w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            disabled={isLoading}
            {...register('confirmPassword', { 
              required: t('signUpForm.confirmPasswordRequired'),
              validate: value => value === watch('password') || t('signUpForm.passwordsMatch')
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
              required: t('signUpForm.agreeToTermsRequired')
            })}
          />
          <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
            {t('signUpForm.agreeToTerms')} {' '}
            <Link href={`/${lng}/terms`} className="text-green-600 hover:text-green-700" target="_blank">
              {t('signUpForm.termsOfService')}
            </Link>{' '}
            {t('signUpForm.and')} {' '}
            <Link href={`/${lng}/privacy`} className="text-green-600 hover:text-green-700" target="_blank">
              {t('signUpForm.privacyPolicy')}
            </Link>
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
          {isLoading ? t('signUpForm.signingUp') : t('signUpForm.signUpButton')}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {t('signUpForm.alreadyHaveAccount')} {' '}
          <button
            onClick={() => {
              const event = new CustomEvent('switchAuthView', { detail: 'signin' });
              window.dispatchEvent(event);
            }}
            className="text-green-600 hover:text-green-700 font-medium"
            disabled={isLoading}
          >
            {t('signUpForm.signIn')}
          </button>
        </p>
      </div>
    </div>
  )
} 
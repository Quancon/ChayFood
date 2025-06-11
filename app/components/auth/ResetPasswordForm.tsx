'use client';

import { useState } from 'react';
import { useAuth } from '../../[lng]/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { XCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '../ui/alert';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface ResetPasswordFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
  tokenFromProps?: string;
  lng: string;
}

export default function ResetPasswordForm({
  onClose,
  onSuccess,
  tokenFromProps,
  lng,
}: ResetPasswordFormProps) {
  const { t } = useTranslation();
  const formSchema = z
    .object({
      password: z.string().min(6, t('resetPasswordForm.passwordMinLength')),
      confirmPassword: z.string().min(6, t('resetPasswordForm.confirmPasswordMinLength')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('resetPasswordForm.passwordMismatch'),
      path: ['confirmPassword'],
    });
  
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetToken = tokenFromProps || searchParams.get('token');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!resetToken) {
      setError(t('resetPasswordForm.invalidToken'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await resetPassword(resetToken, values.password);
      if (result.success) {
        setSuccess(result.message);
        form.reset();
        // Chuyển hướng sau vài giây
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.push(`/${lng}/`);
          }
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch {
      setError(t('resetPasswordForm.genericError'));
    } finally {
      setIsLoading(false);
    }
  }

  // Kiểm tra nếu không có token và không được truyền từ props
  if (!resetToken && !isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            {t('resetPasswordForm.tokenExpired')}
          </AlertDescription>
        </Alert>
        <Button className="w-full" onClick={() => router.push(`/${lng}/`)}>
          {t('resetPasswordForm.returnToHome')}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('resetPasswordForm.title')}</h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XCircle className="h-5 w-5" />
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 bg-green-50 border-green-500 text-green-700">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('resetPasswordForm.newPassword')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('resetPasswordForm.newPasswordPlaceholder')}
                      {...field}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('resetPasswordForm.confirmPassword')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t('resetPasswordForm.confirmPasswordPlaceholder')}
                      {...field}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('resetPasswordForm.processing')}
              </>
            ) : (
              t('resetPasswordForm.resetButton')
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
} 
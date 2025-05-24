'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { XCircle, Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '../../components/ui/alert';

const formSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

interface ForgotPasswordFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
  onToggleForm?: () => void;
}

export default function ForgotPasswordForm({
  onClose,
  onSuccess,
  onToggleForm,
}: ForgotPasswordFormProps) {
  const { forgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await forgotPassword(values.email);
      if (result.success) {
        setSuccess(result.message);
        form.reset();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quên mật khẩu</h2>
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="Email của bạn" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang gửi...
              </>
            ) : (
              'Gửi email đặt lại mật khẩu'
            )}
          </Button>

          {onToggleForm && (
            <div className="mt-4 text-center">
              <Button variant="link" onClick={onToggleForm} type="button">
                Quay lại đăng nhập
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
} 
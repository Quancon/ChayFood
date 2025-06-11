"use client";

import ResetPasswordForm from '../../components/auth/ResetPasswordForm';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';

export default function ResetPasswordPageClient() {
  const { t } = useTranslation();
  const params = useParams();
  const { lng } = params as { lng: string };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">{t('resetPassword.title')}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {t('resetPassword.subtitle')}
          </p>
        </div>
        
        <div className="mt-8">
          <ResetPasswordForm lng={lng} />
        </div>
      </div>
    </div>
  );
} 
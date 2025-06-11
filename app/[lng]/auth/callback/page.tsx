import initTranslations from '@/i18n';
import TranslationsProvider from '@/components/TranslationsProvider';
import AuthCallbackClient from './AuthCallbackClient';
import { Suspense } from 'react';

interface AuthCallbackPageProps {
  params: Promise<{ lng: string }>;
}

export default async function AuthCallback({
  params,
}: AuthCallbackPageProps) {
  const { lng } = await params;
  const { t, resources } = await initTranslations(lng, ['common']);

  return (
    <TranslationsProvider resources={resources} locale={lng} namespaces={['common']}>
      <Suspense fallback={
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="w-16 h-16 border-t-4 border-green-500 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-700">{t('authCallbackPage.loading')}</p>
        </div>
      }>
        <AuthCallbackClient lng={lng} />
      </Suspense>
    </TranslationsProvider>
  )
} 
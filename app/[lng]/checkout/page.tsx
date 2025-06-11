import initTranslations from '@/i18n';
import TranslationsProvider from '@/components/TranslationsProvider';
import CheckoutPageClient from './CheckoutPageClient';

interface CheckoutPageProps {
  params: Promise<{ lng: string }>;
}

export default async function CheckoutPage({
  params,
}: CheckoutPageProps) {
  const { lng } = await params;
  const { resources } = await initTranslations(lng, ['common']);

  return (
    <TranslationsProvider resources={resources} locale={lng} namespaces={['common']}>
      <CheckoutPageClient lng={lng} />
    </TranslationsProvider>
  );
} 
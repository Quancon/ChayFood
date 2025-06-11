import initTranslations from '@/i18n';
import TranslationsProvider from '@/components/TranslationsProvider';
import OrdersPageClient from './OrdersPageClient';

interface OrdersPageProps {
  params: Promise<{ lng: string }>;
}

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { lng } = await params;
  const { resources } = await initTranslations(lng, ['common']);

  return (
    <TranslationsProvider resources={resources} locale={lng} namespaces={['common']}>
      <OrdersPageClient lng={lng} />
    </TranslationsProvider>
  );
} 
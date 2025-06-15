import initTranslations from '@/i18n';
import TranslationsProvider from '@/components/TranslationsProvider';
import SubscriptionPageClient from './SubscriptionPageClient';

interface SubscriptionPageProps {
  params: Promise<{ lng: string }>;
}

export default async function SubscriptionPage({ params }: SubscriptionPageProps) {
  const { lng } = await params;
  const { resources } = await initTranslations(lng, ['common']);

  return (
    <TranslationsProvider resources={resources} locale={lng} namespaces={['common']}>
      <SubscriptionPageClient lng={lng} />
    </TranslationsProvider>
  );
} 
import initTranslations from '@/i18n';
import TranslationsProvider from '@/components/TranslationsProvider';
import PromotionPageClient from './PromotionPageClient';

interface PromotionPageProps {
  params: Promise<{ lng: string }>;
}

export default async function PromotionPage({ params }: PromotionPageProps) {
  const { lng } = await params;
  const { resources } = await initTranslations(lng, ['common']);

  return (
    <TranslationsProvider resources={resources} locale={lng} namespaces={['common']}>
      <PromotionPageClient />
    </TranslationsProvider>
  );
} 
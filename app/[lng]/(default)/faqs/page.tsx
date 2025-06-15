import initTranslations from '@/i18n';
import TranslationsProvider from '@/components/TranslationsProvider';
import FAQsClient from './FAQsClient';

interface FAQsPageProps {
  params: Promise<{ lng: string }>;
}

export default async function FAQs({
  params,
}: FAQsPageProps) {
  const { lng } = await params;
  const { resources } = await initTranslations(lng, ['common']);

  return (
    <TranslationsProvider resources={resources} locale={lng} namespaces={['common']}>
      <FAQsClient />
    </TranslationsProvider>
  );
} 
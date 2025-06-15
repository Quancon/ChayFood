import initTranslations from '@/i18n';
import TranslationsProvider from '@/components/TranslationsProvider';
import NewsClient from './NewsClient';

interface NewsPageProps {
  params: Promise<{ lng: string }>;
}

export default async function News({
  params,
}: NewsPageProps) {
  const { lng } = await params;
  const { resources } = await initTranslations(lng, ['common']);

  return (
    <TranslationsProvider resources={resources} locale={lng} namespaces={['common']}>
      <NewsClient lng={lng} />
    </TranslationsProvider>
  );
} 
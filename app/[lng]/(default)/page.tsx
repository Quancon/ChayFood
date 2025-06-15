import initTranslations from '@/i18n';
import TranslationsProvider from '@/components/TranslationsProvider';
import HomePage from '@/components/HomePage';

export default async function Home({
  params
}: {
  params: Promise<{ lng: string }>
}) {
  const { lng } = await params;
  const { resources } = await initTranslations(lng, ['home', 'common']);

  return (
    <TranslationsProvider resources={resources} locale={lng} namespaces={['home', 'common']}>
      <HomePage />
    </TranslationsProvider>
  );
} 
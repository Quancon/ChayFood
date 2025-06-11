import initTranslations from '../../i18n';
import TranslationsProvider from '../../components/TranslationsProvider';
import PartyPageClient from './PartyPageClient';

interface PartyPageProps {
  params: Promise<{ lng: string }>;
}

export default async function PartyPage({
  params,
}: PartyPageProps) {
  const { lng } = await params;
  const { resources } = await initTranslations(lng, ['common']);

  return (
    <TranslationsProvider resources={resources} locale={lng} namespaces={['common']}>
      <PartyPageClient />
    </TranslationsProvider>
  );
}
import initTranslations from '@/i18n';
import TranslationsProvider from '@/components/TranslationsProvider';
import SettingsPageClient from './SettingsPageClient';

interface SettingsPageProps {
  params: Promise<{ lng: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { lng } = await params;
  const { resources } = await initTranslations(lng, ['common']);

  return (
    <TranslationsProvider resources={resources} locale={lng} namespaces={['common']}>
      <SettingsPageClient lng={lng} />
    </TranslationsProvider>
  );
} 
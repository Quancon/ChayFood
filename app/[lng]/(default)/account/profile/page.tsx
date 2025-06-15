import { ProfilePageClient } from "./ProfilePageClient";
import initTranslations from '@/i18n';
import TranslationsProvider from '@/components/TranslationsProvider';

interface ProfilePageProps {
  params: Promise<{ lng: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { lng } = await params;
  const { resources } = await initTranslations(lng, ['common']);

  return (
    <TranslationsProvider resources={resources} locale={lng} namespaces={['common']}>
      <ProfilePageClient />
    </TranslationsProvider>
  );
} 
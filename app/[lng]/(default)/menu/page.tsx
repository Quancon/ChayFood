import initTranslations from '@/i18n';
import TranslationsProvider from '@/components/TranslationsProvider';
import MenuPageClient from './MenuPageClient';

interface MenuPageProps {
  params: Promise<{ lng: string }>;
}

export default async function MenuPage({
  params,
}: MenuPageProps) {
  const { lng } = await params;
  const { resources } = await initTranslations(lng, ['common', 'menu']);

  return (
    <TranslationsProvider resources={resources} locale={lng} namespaces={['common', 'menu']}>
      <MenuPageClient lng={lng} />
    </TranslationsProvider>
  );
} 
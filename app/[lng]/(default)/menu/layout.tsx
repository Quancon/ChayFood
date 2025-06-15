import TranslationsProvider from '@/components/TranslationsProvider';
import initTranslations from '@/i18n';

interface MenuLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lng: string }>;
}

const i18nNamespaces = ['common'];

export default async function MenuLayout({
  children,
  params,
}: MenuLayoutProps) {
  const { lng } = await params;
  const { resources } = await initTranslations(lng, i18nNamespaces);

  return (
    <TranslationsProvider
      resources={resources}
      locale={lng}
      namespaces={i18nNamespaces}
    >
      {children}
    </TranslationsProvider>
  );
} 
import TranslationsProvider from '@/components/TranslationsProvider';
import initTranslations from '@/i18n';

interface AuthCallbackLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lng: string }>;
}

const i18nNamespaces = ['common'];

export default async function AuthCallbackLayout({
  children,
  params,
}: AuthCallbackLayoutProps) {
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
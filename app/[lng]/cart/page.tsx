import initTranslations from '../../i18n';
import TranslationsProvider from '../../components/TranslationsProvider';
import CartPageClient from './CartPageClient';

interface CartPageProps {
  params: Promise<{ lng: string }>;
}

export default async function CartPage({
  params,
}: CartPageProps) {
  const { lng } = await params;
  const { resources } = await initTranslations(lng, ['common']);

  return (
    <TranslationsProvider resources={resources} locale={lng} namespaces={['common']}>
      <CartPageClient lng={lng} />
    </TranslationsProvider>
  );
} 
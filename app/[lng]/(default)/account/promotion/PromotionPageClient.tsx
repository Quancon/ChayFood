"use client";
import { useTranslation } from 'react-i18next';

export default function PromotionPageClient() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      <h1 className="text-2xl font-bold mb-6">{t('accountPromotionPage.pageTitle')}</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">{t('accountPromotionPage.noPromotionsMessage')}</p>
      </div>
    </div>
  );
}
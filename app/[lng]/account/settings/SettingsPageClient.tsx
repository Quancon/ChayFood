"use client";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

interface SettingsPageClientProps {
  lng: string;
}

export default function SettingsPageClient({ lng }: SettingsPageClientProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [language, setLanguage] = useState(lng);

  const handleLanguageChange = (newLng: string) => {
    setLanguage(newLng);
    router.push(`/${newLng}/account/settings`);
  }

  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      <h1 className="text-2xl font-bold mb-6">{t('accountSettingsPage.languageSettingsTitle')}</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <label className="block mb-2 font-medium">{t('accountSettingsPage.chooseLanguageLabel')}</label>
        <select
          value={language}
          onChange={e => handleLanguageChange(e.target.value)}
          className="border rounded px-4 py-2"
        >
          <option value="vi">{t('accountSettingsPage.vietnameseOption')}</option>
          <option value="en">{t('accountSettingsPage.englishOption')}</option>
        </select>
        <p className="mt-4 text-gray-600">{t('accountSettingsPage.demoMessage')}</p>
      </div>
    </div>
  );
} 
'use client';

import { I18nextProvider } from 'react-i18next';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next/initReactI18next';
import { fallbackLng, languages } from '@/i18n/settings';
import { useEffect } from 'react';

interface TranslationsProviderProps {
  children: React.ReactNode;
  locale: string;
  namespaces: string[];
  resources: Record<string, Record<string, string>>;
}

export default function TranslationsProvider({
  children,
  locale,
  namespaces,
  resources
}: TranslationsProviderProps) {
  const i18n = createInstance();

  // Ensure single namespace for fallback and default from the namespaces array
  const singleNamespace = namespaces[0] || fallbackLng;

  i18n
    .use(initReactI18next)
    .init({
      supportedLngs: languages,
      fallbackLng: fallbackLng,
      lng: locale,
      fallbackNS: singleNamespace,
      defaultNS: singleNamespace,
      ns: namespaces,
      resources,
      react: {
          useSuspense: false,
      }
    });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedLanguage', locale);
    }
  }, [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
} 
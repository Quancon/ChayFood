'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { languages } from '@/i18n/settings';
import Cookies from 'js-cookie';

export default function LanguageChanger() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const currentPathname = usePathname();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;

    // set cookie for next-i18n-router
    Cookies.set('i18next', newLocale);

    // redirect to the new locale path
    const pathSegments = currentPathname.split('/');
    pathSegments[1] = newLocale;
    const newPath = pathSegments.join('/');
    
    router.push(newPath);
    router.refresh();
  };

  return (
    <select onChange={handleChange} value={i18n.language} className="bg-transparent text-gray-700">
      {languages.map((lng) => (
        <option key={lng} value={lng}>
          {lng.toUpperCase()}
        </option>
      ))}
    </select>
  );
} 
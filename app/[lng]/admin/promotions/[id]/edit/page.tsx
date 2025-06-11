"use client"

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Suspense } from 'react';
import { promotionService } from '@/lib/services';
import { Promotion } from '@/lib/services/types';
import PromotionForm from '@/components/admin/promotions/PromotionForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function EditPromotionPage() {
  const params = useParams();
  const { id, lng } = params as { id: string; lng: string };
  const { t } = useTranslation();

  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const response = await promotionService.getById(id);
        setPromotion(response.data as Promotion);
      } catch (err: unknown) {
        const error = err as { message?: string };
        console.error('Error fetching promotion:', error);
        setError(t('promotionPage.loadError', { message: error.message || 'unknown' }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotion();
  }, [id, t]);

  if (isLoading) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
    );
  }

  if (error || !promotion) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <Link 
          href={`/${lng}/admin/promotions`}
          className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm mb-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t('common.backToPromotions')}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{t('promotionPage.editTitle', { name: promotion.name })}</h1>
      </div>
      
      <Suspense fallback={<div className="h-96 bg-gray-100 rounded-lg animate-pulse" />}>
        <PromotionForm initialData={promotion} isEditing={true} lng={lng} />
      </Suspense>
    </div>
  );
} 
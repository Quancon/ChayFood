"use client"

import { Suspense } from 'react';
import PromotionForm from '@/components/admin/promotions/PromotionForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CreatePromotionPage() {
  const params = useParams();
  const { lng } = params as { lng: string };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <Link 
          href={`/${lng}/admin/promotions`}
          className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm mb-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Promotions
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Create Promotion</h1>
      </div>
      
      <Suspense fallback={<div className="h-96 bg-gray-100 rounded-lg animate-pulse" />}>
        <PromotionForm lng={lng} />
      </Suspense>
    </div>
  );
} 
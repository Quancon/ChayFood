"use client"

import { useState, useEffect } from 'react';
import { notFound, useRouter, useParams } from 'next/navigation';
import { promotionService } from '@/lib/services';
import { Promotion } from '@/lib/services/types';
import { ArrowLeftIcon, PencilIcon, TrashIcon, ClockIcon, CalendarIcon, CurrencyDollarIcon, ShoppingCartIcon, CheckCircleIcon, TagIcon, BoltIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from 'react-i18next';

// Helper to format date
const formatDate = (dateString: string, lng: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };
  return new Date(dateString).toLocaleDateString(lng, options);
};

export default function PromotionDetailPage() {
  const params = useParams();
  const { id, lng } = params as { id: string; lng: string };
  const router = useRouter();
  const { t } = useTranslation();
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        if (!id) return;
        const response = await promotionService.getStats(id);
        setPromotion(response.data.promotion);
      } catch (err: unknown) {
        const error = err as { message?: string };
        console.error('Error fetching promotion:', error);
        setError(t('promotionDetails.loadError', { message: error.message || 'Failed to load promotion' }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotion();
  }, [id, t]);

  const handleDelete = async () => {
    try {
      if (!id) return;
      await promotionService.delete(id);
      router.push(`/${lng}/admin/promotions`);
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Error deleting promotion:', error);
      setError(t('promotionDetails.deleteError', { message: error.message || 'Failed to delete promotion' }));
    }
  };

  const getPromotionStatus = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    if (!promotion.isActive) {
      return {
        label: t('promotionDetails.status.inactive'),
        color: "bg-gray-200 text-gray-800"
      };
    }
    
    if (now < startDate) {
      return {
        label: t('promotionDetails.status.upcoming'),
        color: "bg-blue-100 text-blue-800"
      };
    }
    
    if (now > endDate) {
      return {
        label: t('promotionDetails.status.expired'),
        color: "bg-red-100 text-red-800"
      };
    }
    
    return {
      label: t('promotionDetails.status.active'),
      color: "bg-green-100 text-green-800"
    };
  };

  if (isLoading) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
    );
  }

  if (error || !promotion) {
    return notFound();
  }

  const status = getPromotionStatus(promotion);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link 
            href={`/${lng}/admin/promotions`}
            className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm mb-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {t('common.backToPromotions')}
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('promotionDetails.title', { name: promotion.name })}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/${lng}/admin/promotions/${id}/edit`}>
            <Button variant="outline" className="flex items-center gap-2">
              <PencilIcon className="h-4 w-4" />
              {t('common.edit')}
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            {t('common.delete')}
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {t('common.error')}: {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Main Info Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{t('promotionDetails.infoCardTitle')}</CardTitle>
              <Badge className={status.color}>
                {status.label}
              </Badge>
            </div>
            <CardDescription>
              {promotion.promotionType === 'regular' ? (
                <div className="flex items-center">
                  <TagIcon className="h-4 w-4 mr-1 text-green-500" />
                  {t('promotionDetails.type.regular')}
                </div>
              ) : (
                <div className="flex items-center">
                  <BoltIcon className="h-4 w-4 mr-1 text-amber-500" />
                  {t('promotionDetails.type.flashSale')}
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('common.description')}</h3>
              <p className="mt-1">{promotion.description}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t('promotionDetails.codeLabel')}</h3>
                <p className="mt-1 text-lg font-mono font-medium">{promotion.code}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t('promotionDetails.discountLabel')}</h3>
                <p className="mt-1 flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-1" />
                  {promotion.type === 'percentage' 
                    ? t('promotionDetails.discount.percentage', { value: promotion.value }) 
                    : promotion.type === 'fixed' 
                      ? t('promotionDetails.discount.fixed', { value: promotion.value.toLocaleString() })
                      : promotion.type === 'free_item'
                        ? t('promotionDetails.discount.freeItem')
                        : t('promotionDetails.discount.freeDelivery')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t('promotionDetails.minOrderValue')}</h3>
                <p className="mt-1">{promotion.minOrderValue?.toLocaleString()} VND</p>
              </div>
              {promotion.type === 'percentage' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">{t('promotionDetails.maxDiscount')}</h3>
                  <p className="mt-1">{promotion.maxDiscount?.toLocaleString()} VND</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t('common.startDate')}</h3>
                <p className="mt-1 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                  {formatDate(promotion.startDate, lng)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t('common.endDate')}</h3>
                <p className="mt-1 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                  {formatDate(promotion.endDate, lng)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('promotionDetails.totalCodes')}</h3>
              <p className="mt-1 flex items-center">
                <ShoppingCartIcon className="h-4 w-4 mr-1 text-gray-400" />
                {promotion.totalCodes.toLocaleString()} codes
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('promotionDetails.usedCodes')}</h3>
              <p className="mt-1 flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-1 text-gray-400" />
                {promotion.usedCodes.toLocaleString()} codes
              </p>
            </div>

          </CardContent>
        </Card>

        {/* Activity Log Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('promotionDetails.activityLogTitle')}</CardTitle>
            <CardDescription>{t('promotionDetails.activityLogDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-start">
                <ClockIcon className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-800">{t('promotionDetails.logCreated', { date: formatDate(promotion.createdAt || '', lng) })}</p>
                </div>
              </li>
              <li className="flex items-start">
                <ClockIcon className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-800">{t('promotionDetails.logLastUpdated', { date: formatDate(promotion.updatedAt || '', lng) })}</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('promotionDetails.confirmDeleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('promotionDetails.confirmDeleteDescription')}
            </DialogDescription>
          </DialogHeader>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t('common.delete')}</Button>
          </CardFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
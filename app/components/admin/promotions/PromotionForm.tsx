"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { promotionService } from '@/lib/services';
import { Promotion } from '@/lib/services/types';
import { useTranslation } from 'react-i18next';

interface PromotionFormProps {
  initialData?: Partial<Promotion>;
  isEditing?: boolean;
  lng: string;
}

export default function PromotionForm({ initialData, isEditing = false, lng }: PromotionFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [code, setCode] = useState(initialData?.code || '');
  const [type, setType] = useState<Promotion['type']>(initialData?.type || 'percentage');
  const [value, setValue] = useState(initialData?.value || 0);
  const [minOrderValue, setMinOrderValue] = useState(initialData?.minOrderValue || 0);
  const [maxDiscount, setMaxDiscount] = useState(initialData?.maxDiscount || 0);
  const [startDate, setStartDate] = useState(initialData?.startDate ? new Date(initialData.startDate) : new Date());
  const [endDate, setEndDate] = useState(initialData?.endDate ? new Date(initialData.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [isActive, setIsActive] = useState(initialData?.isActive !== undefined ? initialData.isActive : true);
  const [isFlashSale, setIsFlashSale] = useState(initialData?.isFlashSale || false);
  const [totalCodes, setTotalCodes] = useState(initialData?.totalCodes || 100);
  const [promotionType, setPromotionType] = useState<Promotion['promotionType']>(initialData?.promotionType || 'regular');
  const [shouldNotify, setShouldNotify] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = {
      name,
      description,
      code,
      type,
      value,
      minOrderValue,
      maxDiscount,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      isActive,
      isFlashSale,
      totalCodes,
      usedCodes: initialData?.usedCodes || 0,
      promotionType,
      shouldNotify,
    };

    try {
      if (isEditing && initialData?._id) {
        await promotionService.update(initialData._id, formData);
      } else {
        if (formData.promotionType === 'flash_sale') {
          await promotionService.createFlashSale(formData);
        } else {
          await promotionService.create(formData);
        }
      }
      
      router.push(`/${lng}/admin/promotions`);
      router.refresh();
    } catch (err: unknown) {
      console.error('Error submitting promotion:', err);
      if (err instanceof Error) {
        setError(t('promotionForm.saveError', { message: err.message }));
      } else {
        setError(t('promotionForm.saveErrorGeneric'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold">
          {isEditing ? t('promotionForm.editTitle') : t('promotionForm.createTitle')}
        </h2>
        <p className="text-gray-500">
          {isEditing 
            ? t('promotionForm.editDescription') 
            : t('promotionForm.createDescription')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">{t('common.error')}: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">{t('promotionForm.nameLabel')}</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
              placeholder={t('promotionForm.namePlaceholder')}
            />
            <span className="text-xs text-gray-500 mt-1">{t('promotionForm.nameHint')}</span>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('promotionForm.codeLabel')}</label>
            <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full p-2 border rounded-md"
              required
              placeholder={t('promotionForm.codePlaceholder')}
            />
            <span className="text-xs text-gray-500 mt-1">{t('promotionForm.codeHint')}</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">{t('promotionForm.descriptionLabel')}</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-md min-h-[100px]"
            required
            placeholder={t('promotionForm.descriptionPlaceholder')}
          />
          <span className="text-xs text-gray-500 mt-1">{t('promotionForm.descriptionHint')}</span>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">{t('promotionForm.promotionTypeLabel')}</label>
            <select 
              value={promotionType}
              onChange={(e) => {
                setPromotionType(e.target.value as Promotion['promotionType']);
                if (e.target.value === 'flash_sale') {
                  setIsFlashSale(true);
                }
              }}
              className="w-full p-2 border rounded-md"
            >
              <option value="regular">{t('promotionForm.regularPromotion')}</option>
              <option value="flash_sale">{t('promotionForm.flashSale')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('promotionForm.discountTypeLabel')}</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value as Promotion['type'])}
              className="w-full p-2 border rounded-md"
            >
              <option value="percentage">{t('promotionForm.percentageDiscount')}</option>
              <option value="fixed">{t('promotionForm.fixedAmount')}</option>
              <option value="free_item">{t('promotionForm.freeItem')}</option>
              <option value="free_delivery">{t('promotionForm.freeDelivery')}</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              {type === 'percentage' 
                ? t('promotionForm.discountPercentage') 
                : type === 'fixed' 
                  ? t('promotionForm.discountAmount') 
                  : t('promotionForm.value')}
            </label>
            <input 
              type="number"
              min={0}
              step={type === 'percentage' ? 1 : 1000}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('promotionForm.minOrderValueLabel')}</label>
            <input 
              type="number"
              min={0}
              step={1000}
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
            />
            <span className="text-xs text-gray-500 mt-1">{t('promotionForm.minOrderValueHint')}</span>
          </div>
          
          {type === 'percentage' && (
            <div>
              <label className="block text-sm font-medium mb-1">{t('promotionForm.maxDiscountLabel')}</label>
              <input 
                type="number"
                min={0}
                step={1000}
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(Number(e.target.value))}
                className="w-full p-2 border rounded-md"
              />
              <span className="text-xs text-gray-500 mt-1">{t('promotionForm.maxDiscountHint')}</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">{t('promotionForm.startDateLabel')}</label>
            <input
              type="date"
              value={startDate.toISOString().split('T')[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('promotionForm.endDateLabel')}</label>
            <input
              type="date"
              value={endDate.toISOString().split('T')[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium">{t('promotionForm.isActiveLabel')}</label>
        </div>

        {promotionType === 'flash_sale' && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFlashSale"
              checked={isFlashSale}
              onChange={(e) => setIsFlashSale(e.target.checked)}
              className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="isFlashSale" className="text-sm font-medium">{t('promotionForm.isFlashSaleLabel')}</label>
          </div>
        )}

        {promotionType === 'flash_sale' && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="shouldNotify"
              checked={shouldNotify}
              onChange={(e) => setShouldNotify(e.target.checked)}
              className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="shouldNotify" className="text-sm font-medium">{t('promotionForm.shouldNotifyLabel')}</label>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promotionType === 'regular' && (
            <div>
              <label className="block text-sm font-medium mb-1">{t('promotionForm.totalCodesLabel')}</label>
              <input 
                type="number"
                min={0}
                value={totalCodes}
                onChange={(e) => setTotalCodes(Number(e.target.value))}
                className="w-full p-2 border rounded-md"
                required
              />
              <span className="text-xs text-gray-500 mt-1">{t('promotionForm.totalCodesHint')}</span>
            </div>
          )}
          
          {isEditing && promotionType === 'regular' && (
            <div>
              <label className="block text-sm font-medium mb-1">{t('promotionForm.usedCodesLabel')}</label>
              <input 
                type="number"
                value={initialData?.usedCodes || 0}
                className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
                readOnly
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button 
            type="button"
            onClick={() => router.push(`/${lng}/admin/promotions`)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            {t('common.cancel')}
          </button>
          <button 
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('common.saving') : (isEditing ? t('common.saveChanges') : t('common.create'))}
          </button>
        </div>
      </form>
    </div>
  );
} 
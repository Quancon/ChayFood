"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { promotionService } from '@/lib/services';
import { Promotion } from '@/lib/services/types';
import Link from 'next/link';

interface PromotionFormProps {
  initialData?: Partial<Promotion>;
  isEditing?: boolean;
}

export default function PromotionForm({ initialData, isEditing = false }: PromotionFormProps) {
  const router = useRouter();
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
      
      router.push('/admin/promotions');
      router.refresh();
    } catch (err: any) {
      console.error('Error submitting promotion:', err);
      setError(err.message || 'Failed to save promotion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold">
          {isEditing ? 'Edit Promotion' : 'Create New Promotion'}
        </h2>
        <p className="text-gray-500">
          {isEditing 
            ? 'Update the details of an existing promotion' 
            : 'Add a new promotion or flash sale to your store'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Promotion Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
              placeholder="Summer Sale"
            />
            <span className="text-xs text-gray-500 mt-1">Minimum 3 characters</span>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Promotion Code</label>
            <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full p-2 border rounded-md"
              required
              placeholder="SUMMER2023"
            />
            <span className="text-xs text-gray-500 mt-1">Users will enter this code at checkout</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-md min-h-[100px]"
            required
            placeholder="Get 15% off on all summer items!"
          />
          <span className="text-xs text-gray-500 mt-1">Explain what this promotion offers to customers</span>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Promotion Type</label>
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
              <option value="regular">Regular Promotion</option>
              <option value="flash_sale">Flash Sale</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Discount Type</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value as Promotion['type'])}
              className="w-full p-2 border rounded-md"
            >
              <option value="percentage">Percentage Discount (%)</option>
              <option value="fixed">Fixed Amount (VND)</option>
              <option value="free_item">Free Item</option>
              <option value="free_delivery">Free Delivery</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              {type === 'percentage' 
                ? 'Discount Percentage (%)' 
                : type === 'fixed' 
                  ? 'Discount Amount (VND)' 
                  : 'Value'}
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
            <label className="block text-sm font-medium mb-1">Minimum Order Value (VND)</label>
            <input 
              type="number"
              min={0}
              step={1000}
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
            />
            <span className="text-xs text-gray-500 mt-1">0 = No minimum</span>
          </div>
          
          {type === 'percentage' && (
            <div>
              <label className="block text-sm font-medium mb-1">Maximum Discount (VND)</label>
              <input 
                type="number"
                min={0}
                step={1000}
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(Number(e.target.value))}
                className="w-full p-2 border rounded-md"
              />
              <span className="text-xs text-gray-500 mt-1">0 = No maximum</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input 
              type="date"
              value={startDate.toISOString().split('T')[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input 
              type="date"
              value={endDate.toISOString().split('T')[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Total Available Codes</label>
            <input 
              type="number"
              min={1}
              value={totalCodes}
              onChange={(e) => setTotalCodes(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              required
            />
            <span className="text-xs text-gray-500 mt-1">Maximum number of times this code can be used</span>
          </div>
          
          {isEditing && (
            <div>
              <label className="block text-sm font-medium mb-1">Used Codes</label>
              <input 
                type="number"
                value={initialData?.usedCodes || 0}
                disabled
                className="w-full p-2 border rounded-md bg-gray-100"
              />
              <span className="text-xs text-gray-500 mt-1">Number of times this code has been used</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="border p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Active Status</p>
                <span className="text-xs text-gray-500">Enable or disable this promotion</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
          
          {!isEditing && promotionType === 'flash_sale' && (
            <div className="border p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Send Notification</p>
                  <span className="text-xs text-gray-500">Notify users about this flash sale</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={shouldNotify}
                    onChange={(e) => setShouldNotify(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => router.push('/admin/promotions')}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? 
              (isEditing ? 'Updating...' : 'Creating...') : 
              (isEditing ? 'Update Promotion' : 'Create Promotion')
            }
          </button>
        </div>
      </form>
    </div>
  );
} 
"use client"

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { promotionService } from '@/lib/services';
import { Promotion } from '@/lib/services/types';
import { ArrowLeftIcon, PencilIcon, TrashIcon, ClockIcon, CalendarIcon, CurrencyDollarIcon, ShoppingCartIcon, CheckCircleIcon, TagIcon, BoltIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
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
  DialogTrigger,
} from "@/components/ui/dialog";

interface PromotionDetailPageProps {
  params: {
    id: string;
  };
}

export default function PromotionDetailPage({ params }: PromotionDetailPageProps) {
  const router = useRouter();
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const response = await promotionService.getStats(params.id);
        setPromotion(response.data.promotion);
        setStats(response.data.stats);
      } catch (err: any) {
        console.error('Error fetching promotion:', err);
        setError(err.message || 'Failed to load promotion');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotion();
  }, [params.id]);

  const handleDelete = async () => {
    try {
      await promotionService.delete(params.id);
      router.push('/admin/promotions');
    } catch (err: any) {
      console.error('Error deleting promotion:', err);
      setError(err.message || 'Failed to delete promotion');
    }
  };

  const getPromotionStatus = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    if (!promotion.isActive) {
      return {
        label: "Inactive",
        color: "bg-gray-200 text-gray-800"
      };
    }
    
    if (now < startDate) {
      return {
        label: "Upcoming",
        color: "bg-blue-100 text-blue-800"
      };
    }
    
    if (now > endDate) {
      return {
        label: "Expired",
        color: "bg-red-100 text-red-800"
      };
    }
    
    return {
      label: "Active",
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
            href="/admin/promotions" 
            className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm mb-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Promotions
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            Promotion Details: {promotion.name}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/promotions/${params.id}/edit`}>
            <Button variant="outline" className="flex items-center gap-2">
              <PencilIcon className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Main Info Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Promotion Information</CardTitle>
              <Badge className={status.color}>
                {status.label}
              </Badge>
            </div>
            <CardDescription>
              {promotion.promotionType === 'regular' ? (
                <div className="flex items-center">
                  <TagIcon className="h-4 w-4 mr-1 text-green-500" />
                  Regular Promotion
                </div>
              ) : (
                <div className="flex items-center">
                  <BoltIcon className="h-4 w-4 mr-1 text-amber-500" />
                  Flash Sale
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1">{promotion.description}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Code</h3>
                <p className="mt-1 text-lg font-mono font-medium">{promotion.code}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Discount</h3>
                <p className="mt-1 flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-1" />
                  {promotion.type === 'percentage' 
                    ? `${promotion.value}% off` 
                    : promotion.type === 'fixed' 
                      ? `${promotion.value.toLocaleString()} VND off`
                      : promotion.type === 'free_item'
                        ? 'Free item'
                        : 'Free delivery'}
                </p>
              </div>
              
              {promotion.minOrderValue > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Minimum Order</h3>
                  <p className="mt-1 flex items-center">
                    <ShoppingCartIcon className="h-5 w-5 text-gray-400 mr-1" />
                    {promotion.minOrderValue.toLocaleString()} VND
                  </p>
                </div>
              )}
              
              {promotion.type === 'percentage' && promotion.maxDiscount > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Maximum Discount</h3>
                  <p className="mt-1 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-gray-400 mr-1" />
                    Up to {promotion.maxDiscount.toLocaleString()} VND
                  </p>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Validity Period</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p>{format(new Date(promotion.startDate), 'PPP')}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p>{format(new Date(promotion.endDate), 'PPP')}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-green-600">
                {stats.usagePercentage}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Usage Rate
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Used Codes</span>
                  <span className="font-medium">{promotion.usedCodes} / {promotion.totalCodes}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(promotion.usedCodes / promotion.totalCodes) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{promotion.totalCodes - promotion.usedCodes}</p>
                  <p className="text-xs text-gray-500">Remaining Codes</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-600">{stats.daysRemaining}</p>
                  <p className="text-xs text-gray-500">Days Remaining</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Status</p>
              <div className="flex items-center space-x-2">
                <Badge className={status.color}>
                  {status.label}
                </Badge>
                {stats.isExpired && <span className="text-sm text-red-500">Expired</span>}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-gray-500">
              Created on {format(new Date(promotion.createdAt || new Date()), 'PP')}
            </p>
          </CardFooter>
        </Card>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Promotion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the promotion "{promotion.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
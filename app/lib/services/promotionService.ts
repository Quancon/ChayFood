import api from './apiClient';
import { Promotion } from './types';

interface PromotionResponse {
  status: string;
  message: string;
  data: Promotion | Promotion[];
}

interface PromotionsListResponse {
  status: string;
  message: string;
  data: {
    promotions: Promotion[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasMore: boolean;
    }
  }
}

interface PromotionStatsResponse {
  status: string;
  message: string;
  data: {
    promotion: Promotion;
    stats: {
      totalCodes: number;
      usedCodes: number;
      remainingCodes: number;
      usagePercentage: string;
      isActive: boolean;
      isExpired: boolean;
      daysRemaining: number;
    }
  }
}

export const promotionService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    isActive?: boolean;
    promotionType?: string;
    status?: 'active' | 'upcoming' | 'expired';
  }) => {
    const response = await api.get<PromotionsListResponse>('/promotions', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<PromotionResponse>(`/promotions/${id}`);
    return response.data;
  },

  create: async (promotionData: Partial<Promotion>) => {
    const response = await api.post<PromotionResponse>('/promotions', promotionData);
    return response.data;
  },

  createFlashSale: async (flashSaleData: Partial<Promotion> & { shouldNotify?: boolean }) => {
    const response = await api.post<PromotionResponse>('/promotions/flash-sale', flashSaleData);
    return response.data;
  },

  update: async (id: string, promotionData: Partial<Promotion>) => {
    const response = await api.put<PromotionResponse>(`/promotions/${id}`, promotionData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ status: string; message: string }>(`/promotions/${id}`);
    return response.data;
  },

  getActiveFlashSales: async () => {
    const response = await api.get<PromotionResponse>('/promotions/flash-sales/active');
    return response.data;
  },

  getStats: async (id: string) => {
    const response = await api.get<PromotionStatsResponse>(`/promotions/${id}/stats`);
    return response.data;
  }
}; 
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
    const response = await api.get<PromotionsListResponse>('/promotion', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<PromotionResponse>(`/promotion/${id}`);
    return response.data;
  },

  create: async (promotionData: Partial<Promotion>) => {
    const response = await api.post<PromotionResponse>('/promotion', promotionData);
    return response.data;
  },

  createFlashSale: async (flashSaleData: Partial<Promotion> & { shouldNotify?: boolean }) => {
    const response = await api.post<PromotionResponse>('/promotion/flash-sale', flashSaleData);
    return response.data;
  },

  update: async (id: string, promotionData: Partial<Promotion>) => {
    const response = await api.put<PromotionResponse>(`/promotion/${id}`, promotionData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ status: string; message: string }>(`/promotion/${id}`);
    return response.data;
  },

  getActiveFlashSales: async () => {
    const response = await api.get<PromotionResponse>('/promotion/active-flash-sales');
    return response.data;
  },

  getStats: async (id: string) => {
    const response = await api.get<PromotionStatsResponse>(`/promotion/${id}/stats`);
    return response.data;
  }
}; 
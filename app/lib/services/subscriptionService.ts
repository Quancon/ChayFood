import api from './apiClient';
import type { CreateSubscriptionDto, Subscription } from './types';

export const planService = {
  // Get all plans
  getAll: async () => {
    const response = await api.get('/plan');
    return response.data;
  },
  
  // Get plan by ID
  getById: async (id: string) => {
    const response = await api.get(`/plan/${id}`);
    return response.data;
  }
};

export const subscriptionService = {
  // Get available subscription plans
  getAvailablePlans: async () => {
    const response = await api.get('/subscription/plans');
    return response.data;
  },
  
  // Create a new subscription
  create: async (subscription: CreateSubscriptionDto) => {
    const response = await api.post('/subscription', subscription);
    return response.data;
  },
  
  // Get user's subscriptions
  getMySubscriptions: async () => {
    const response = await api.get('/subscription/my-subscriptions');
    return response.data;
  },
  
  // Get subscription by ID
  getById: async (id: string) => {
    const response = await api.get(`/subscription/${id}`);
    return response.data;
  },
  
  // Update subscription menu selections
  updateMenu: async (id: string, selectedMenuItems: Subscription['selectedMenuItems']) => {
    const response = await api.patch(`/subscription/${id}/menu`, { selectedMenuItems });
    return response.data;
  },
  
  // Cancel subscription
  cancel: async (id: string) => {
    const response = await api.patch(`/subscription/${id}/cancel`);
    return response.data;
  }
}; 
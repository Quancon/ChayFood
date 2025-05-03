import api from './apiClient';
import type { MenuItem } from './types';

export const menuService = {
  // Get all menu items with optional filters
  getAll: async (params?: {
    category?: string;
    minCalories?: number;
    maxCalories?: number;
    minProtein?: number;
    maxProtein?: number;
    spicyLevel?: number;
    limit?: number;
  }) => {
    try {
      // Add default limit if not provided
      const paramsWithDefaults = {
        limit: 100, // Default limit
        ...params
      };

      // Clean up undefined values but keep empty strings and zeros
      const cleanParams = Object.fromEntries(
        Object.entries(paramsWithDefaults)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => {
            // Convert spicyLevel to number if it exists
            if (key === 'spicyLevel' && value !== undefined) {
              return [key, Number(value)];
            }
            return [key, value];
          })
      );
      
      console.log('MenuService: Getting all with params:', {
        original: params,
        withDefaults: paramsWithDefaults,
        cleaned: cleanParams,
        url: '/menu',
        spicyLevel: cleanParams.spicyLevel,
        category: cleanParams.category,
        limit: cleanParams.limit
      });

      const response = await api.get('/menu', { 
        params: cleanParams
      });
      
      console.log('MenuService: Raw getAll response:', {
        data: response.data,
        type: typeof response.data,
        isArray: Array.isArray(response.data),
        status: response.status,
        requestUrl: response.config.url,
        requestParams: response.config.params
      });
      
      // Ensure we always return an array, even if empty
      let items = [];
      if (Array.isArray(response.data)) {
        items = response.data;
      } else if (response.data?.data) {
        items = response.data.data;
      } else if (response.data?.items) {
        items = response.data.items;
      }
      
      console.log('MenuService: Processed response:', {
        itemCount: items.length,
        firstItem: items[0],
        params: cleanParams,
        category: cleanParams.category,
        spicyLevel: cleanParams.spicyLevel
      });
      
      return {
        data: items,
        status: response.status
      };
    } catch (error) {
      console.error('Error fetching menu items:', {
        error,
        params: params,
        cleanParams: Object.fromEntries(
          Object.entries(params || {})
            .filter(([_, value]) => value !== undefined)
        )
      });
      return { data: [], status: 500 };
    }
  },
  
  // Search menu items
  search: async (params: {
    query: string;
    category?: string;
    minCalories?: number;
    maxCalories?: number;
    minProtein?: number;
    maxProtein?: number;
    spicyLevel?: number;
    sort?: 'name' | 'price' | 'calories' | 'protein';
    order?: 'asc' | 'desc';
    limit?: number;
    page?: number;
  }) => {
    try {
      // Add default limit if not provided
      const paramsWithDefaults = {
        limit: 100, // Default limit
        ...params
      };

      // Clean up undefined values but keep empty strings and zeros
      const cleanParams = Object.fromEntries(
        Object.entries(paramsWithDefaults)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => {
            // Convert spicyLevel to number if it exists
            if (key === 'spicyLevel' && value !== undefined) {
              return [key, Number(value)];
            }
            // Trim the query if it's a string
            if (key === 'query' && typeof value === 'string') {
              return [key, value.trim()];
            }
            return [key, value];
          })
      );
      
      console.log('MenuService: Searching with params:', {
        original: params,
        withDefaults: paramsWithDefaults,
        cleaned: cleanParams,
        url: '/menu/search',
        spicyLevel: cleanParams.spicyLevel,
        category: cleanParams.category,
        query: cleanParams.query,
        limit: cleanParams.limit
      });

      // If no search query, use the getAll endpoint with the same filters
      if (!cleanParams.query) {
        console.log('MenuService: No search query, using getAll endpoint with filters');
        return menuService.getAll({ 
          category: cleanParams.category as string,
          spicyLevel: cleanParams.spicyLevel as number
        });
      }
      
      const response = await api.get('/menu/search', { 
        params: cleanParams,
        paramsSerializer: {
          indexes: null // Don't serialize array indexes
        }
      });
      
      console.log('MenuService: Raw search response:', {
        data: response.data,
        type: typeof response.data,
        hasItems: !!response.data?.items,
        status: response.status,
        requestUrl: response.config.url,
        requestParams: response.config.params
      });
      
      // Handle the response structure from backend
      let items = [];
      if (response.data?.items) {
        items = response.data.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      } else if (response.data?.data) {
        items = response.data.data;
      }
      
      console.log('MenuService: Processed search response:', {
        itemCount: items.length,
        firstItem: items[0],
        params: cleanParams,
        category: cleanParams.category,
        spicyLevel: cleanParams.spicyLevel
      });
      
      return {
        data: items,
        status: response.status
      };
    } catch (error) {
      console.error('Error searching menu items:', {
        error,
        params: params,
        cleanParams: Object.fromEntries(
          Object.entries(params)
            .filter(([_, value]) => value !== undefined)
        )
      });
      return { data: [], status: 500 };
    }
  },
  
  // Get menu items by nutritional content
  getByNutrition: async (params: {
    minCalories?: number;
    maxCalories?: number;
    minProtein?: number;
    maxProtein?: number;
  }) => {
    try {
      const response = await api.get('/menu/nutrition', { params });
      return {
        data: Array.isArray(response.data) ? response.data : 
              (response.data.data ? response.data.data : []),
        status: response.status
      };
    } catch (error) {
      console.error('Error fetching menu items by nutrition:', error);
      return { data: [], status: 500 };
    }
  },
  
  // Get menu item by ID
  getById: async (id: string) => {
    try {
      const response = await api.get(`/menu/${id}`);
      return {
        data: response.data.data || response.data,
        status: response.status
      };
    } catch (error) {
      console.error(`Error fetching menu item ${id}:`, error);
      return { data: null, status: 500 };
    }
  },
  
  // Create menu item (admin only)
  create: async (menuItem: Omit<MenuItem, '_id'>) => {
    try {
      const response = await api.post('/menu', menuItem);
      return {
        data: response.data.data || response.data,
        status: response.status
      };
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  },
  
  // Update menu item (admin only)
  update: async (id: string, menuItem: Partial<MenuItem>) => {
    try {
      const response = await api.put(`/menu/${id}`, menuItem);
      return {
        data: response.data.data || response.data,
        status: response.status
      };
    } catch (error) {
      console.error(`Error updating menu item ${id}:`, error);
      throw error;
    }
  },
  
  // Delete menu item (admin only)
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/menu/${id}`);
      return {
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error(`Error deleting menu item ${id}:`, error);
      throw error;
    }
  },
  
  // Update menu item availability (admin only)
  updateAvailability: async (id: string, isAvailable: boolean) => {
    try {
      const response = await api.patch(`/menu/${id}/availability`, { isAvailable });
      return {
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error(`Error updating menu item availability ${id}:`, error);
      throw error;
    }
  }
}; 
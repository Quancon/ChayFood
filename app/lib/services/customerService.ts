import api from './apiClient';
import { Customer } from './types';

interface GetCustomersResponse {
  success: boolean;
  data: Customer[];
  total: number;
  message?: string;
}

interface CustomerResponse {
  success: boolean;
  data: Customer;
  message?: string;
}

interface CustomerServiceProps {
  getCustomers: (page?: number, limit?: number, search?: string) => Promise<GetCustomersResponse>;
  getCustomerById: (id: string) => Promise<CustomerResponse>;
  deleteCustomer: (id: string) => Promise<{ success: boolean; message?: string }>;
}

class CustomerService implements CustomerServiceProps {
  async getCustomers(page = 1, limit = 10, search = ''): Promise<GetCustomersResponse> {
    try {
      const params = { page, limit, search };
      const response = await api.get('/admin/customers', { params });
      
      // Debug log to check the structure
      console.log('Raw customer data:', response.data);
      console.log('Customer data structure:', JSON.stringify(response.data.data.customers[0], null, 2));
      
      // Updated to match the new API response structure
      return {
        success: response.data.status === 'success',
        data: response.data.data.customers,
        total: response.data.data.pagination.totalCount
      };
      
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      return {
        success: false,
        data: [],
        total: 0,
        message: error.response?.data?.message || 'Failed to fetch customers'
      };
    }
  }

  async getCustomerById(id: string): Promise<CustomerResponse> {
    try {
      const response = await api.get(`/admin/customers/${id}`);
      return {
        success: response.data.status === 'success',
        data: response.data.data.customer
      };
    } catch (error: any) {
      console.error(`Error fetching customer with ID ${id}:`, error);
      return {
        success: false,
        data: {} as Customer,
        message: error.response?.data?.message || 'Failed to fetch customer details'
      };
    }
  }

  async deleteCustomer(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.delete(`/admin/customers/${id}`);
      return {
        success: response.data.status === 'success',
        message: response.data.message
      };
    } catch (error: any) {
      console.error(`Error deleting customer with ID ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete customer'
      };
    }
  }
}

export const customerService = new CustomerService(); 
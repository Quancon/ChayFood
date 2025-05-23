import axios from 'axios'

export interface Category {
  id?: number;
  _id?: string;
  name: string;
  description: string;
  slug?: string;
  image?: string;
  isActive?: boolean;
  displayOrder?: number;
}

const API_URL = 'http://localhost:5000/category'

// Helper function to get auth token
const getAuthHeader = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
};

export const categoryService = {
  // Lấy tất cả danh mục
  getAll: async (): Promise<Category[]> => {
    const response = await axios.get(API_URL)
    return response.data
  },

  // Thêm danh mục mới
  create: async (category: Omit<Category, 'id' | '_id'>): Promise<Category> => {
    const response = await axios.post(API_URL, category, {
      headers: getAuthHeader()
    })
    return response.data
  },

  // Cập nhật danh mục
  update: async (id: string | number, category: Partial<Category>): Promise<Category> => {
    const response = await axios.put(`${API_URL}/${id}`, category, {
      headers: getAuthHeader()
    })
    return response.data
  },

  // Xóa danh mục
  delete: async (id: string | number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    })
  }
} 
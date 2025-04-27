import axios from 'axios'

export interface Category {
  id: number
  name: string
  description: string
}

const API_URL = 'http://localhost:5000/api/categories'

export const categoryService = {
  // Lấy tất cả danh mục
  getAll: async (): Promise<Category[]> => {
    const response = await axios.get(API_URL)
    return response.data
  },

  // Thêm danh mục mới
  create: async (category: Omit<Category, 'id'>): Promise<Category> => {
    const response = await axios.post(API_URL, category)
    return response.data
  },

  // Cập nhật danh mục
  update: async (id: number, category: Partial<Category>): Promise<Category> => {
    const response = await axios.put(`${API_URL}/${id}`, category)
    return response.data
  },

  // Xóa danh mục
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`)
  }
} 
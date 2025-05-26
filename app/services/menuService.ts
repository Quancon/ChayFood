import axios from 'axios'

export interface MenuItem {
  id: number
  name: string
  category: string
  price: number
  description: string
  image: string
  isAvailable: boolean
}

const API_URL =  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export const menuService = {
  // Lấy tất cả món ăn
  getAll: async (): Promise<MenuItem[]> => {
    const response = await axios.get(API_URL + '/menu')
    return response.data
  },

  // Lấy món ăn theo danh mục
  getByCategory: async (category: string): Promise<MenuItem[]> => {
    const response = await axios.get(`${API_URL}/menu?category=${category}`)
    return response.data
  },

  // Thêm món ăn mới
  create: async (menuItem: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
    const response = await axios.post(API_URL + '/menu', menuItem)
    return response.data
  },

  // Cập nhật món ăn
  update: async (id: number, menuItem: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await axios.put(`${API_URL}/menu/${id}`, menuItem)
    return response.data
  },

  // Xóa món ăn
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/menu/${id}`)
  },

  // Cập nhật trạng thái món ăn
  updateAvailability: async (id: number, isAvailable: boolean): Promise<MenuItem> => {
    const response = await axios.patch(`${API_URL}/menu/${id}/availability`, { isAvailable })
    return response.data
  }
} 
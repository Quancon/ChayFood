'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { categoryService, Category } from '../../services/categoryService'
import { menuService } from '@/lib/services'
import { MenuItem } from '@/lib/services/types'
import { toast } from 'react-hot-toast'

// Extended Category type to handle both old and new format
interface ExtendedCategory extends Category {
  id?: number;
  _id?: string;
}

export default function MenuPage() {
  const [categories, setCategories] = useState<ExtendedCategory[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ExtendedCategory | null>(null)
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null)
  const [menuItemFormData, setMenuItemFormData] = useState({
    name: '',
    category: '',
    price: 0,
    description: '',
    image: '',
    isAvailable: true
  })
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    slug: '',
    image: '',
    isActive: true,
    displayOrder: 0
  })
  const [isLoading, setIsLoading] = useState(false)

  // Fetch categories and menu items
  useEffect(() => {
    fetchCategories()
    fetchMenuItems()
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll()
      setCategories(data)
    } catch (error) {
      toast.error('Không thể tải danh mục')
    }
  }

  const fetchMenuItems = async () => {
    try {
      const response = await menuService.getAll()
      setMenuItems(response.data)
    } catch (error) {
      toast.error('Không thể tải menu')
    }
  }

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa món này?')) return

    try {
      await menuService.delete(id)
      toast.success('Xóa món thành công')
      fetchMenuItems()
    } catch (error) {
      toast.error('Lỗi xóa món')
    }
  }

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      await menuService.updateAvailability(id, !currentStatus)
      toast.success('Cập nhật trạng thái thành công')
      fetchMenuItems()
    } catch (error) {
      toast.error('Lỗi cập nhật trạng thái')
    }
  }

  const handleDeleteCategory = async (id: string | number) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return

    try {
      await categoryService.delete(id)
      toast.success('Xóa danh mục thành công')
      fetchCategories()
    } catch (error) {
      toast.error('Lỗi xóa danh mục')
    }
  }

  const handleEditCategory = (category: ExtendedCategory) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      description: category.description,
      slug: category.slug || '',
      image: category.image || '',
      isActive: category.isActive !== undefined ? category.isActive : true,
      displayOrder: category.displayOrder || 0
    })
    setShowCategoryForm(true)
  }

  const handleEditMenuItem = (item: MenuItem) => {
    setEditingMenuItem(item)
    setMenuItemFormData({
      name: item.name,
      category: typeof item.category === 'string' ? item.category : (item.category as any)?._id || '',
      price: item.price,
      description: item.description,
      image: item.image,
      isAvailable: item.isAvailable
    })
    setShowAddForm(true)
  }

  // Reset category form
  const resetCategoryForm = () => {
    setShowCategoryForm(false)
    setEditingCategory(null)
    setCategoryFormData({
      name: '',
      description: '',
      slug: '',
      image: '',
      isActive: true,
      displayOrder: 0
    })
  }

  // Handle category form submission
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (editingCategory) {
        await categoryService.update(editingCategory._id || editingCategory.id || '', categoryFormData)
        toast.success('Cập nhật danh mục thành công')
      } else {
        await categoryService.create(categoryFormData)
        toast.success('Thêm danh mục thành công')
      }
      fetchCategories()
      resetCategoryForm()
    } catch (error) {
      toast.error(editingCategory ? 'Lỗi cập nhật danh mục' : 'Lỗi thêm danh mục')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle menu item form submission
  const handleMenuItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (editingMenuItem) {
        // Cast the category string to the required type
        const updatedMenuItem = {
          ...menuItemFormData,
          category: menuItemFormData.category as 'main' | 'side' | 'dessert' | 'beverage'
        }
        await menuService.update(editingMenuItem._id, updatedMenuItem)
        toast.success('Cập nhật món thành công')
      } else {
        // Cast for new item creation too
        const newMenuItem = {
          ...menuItemFormData,
          category: menuItemFormData.category as 'main' | 'side' | 'dessert' | 'beverage'
        }
        await menuService.create(newMenuItem as Omit<MenuItem, '_id'>)
        toast.success('Thêm món thành công')
      }
      fetchMenuItems()
      setShowAddForm(false)
      setEditingMenuItem(null)
      setMenuItemFormData({
        name: '',
        category: '',
        price: 0,
        description: '',
        image: '',
        isAvailable: true
      })
    } catch (error) {
      toast.error(editingMenuItem ? 'Lỗi cập nhật món' : 'Lỗi thêm món')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter menu items based on selected category
  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => {
        // Check if item.category is a string or an object with _id
        if (typeof item.category === 'string') {
          return item.category === selectedCategory;
        } else if (typeof item.category === 'object' && item.category && '_id' in (item.category as any)) {
          return (item.category as any)._id === selectedCategory;
        }
        return false;
      });

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Quản lý thực đơn</h1>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Thêm món mới
        </button>
      </div>

      {/* Category Management */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Danh mục món ăn</h2>
          <button 
            onClick={() => {
              setEditingCategory(null)
              setCategoryFormData({ name: '', description: '', slug: '', image: '', isActive: true, displayOrder: 0 })
              setShowCategoryForm(true)
            }}
            className="text-green-600 hover:text-green-700 flex items-center gap-1"
          >
            <PlusIcon className="h-5 w-5" />
            Thêm danh mục
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category._id || category.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-medium">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEditCategory(category)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => handleDeleteCategory(category._id || category.id || '')}
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
              </h3>
              <button 
                onClick={resetCategoryForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tên danh mục
                </label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Nhập tên danh mục"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mô tả
                </label>
                <textarea
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Nhập mô tả danh mục"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={categoryFormData.slug}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Nhập slug (vd: mon-chinh)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Hình ảnh
                </label>
                <input
                  type="text"
                  value={categoryFormData.image}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, image: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Nhập URL hình ảnh"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={categoryFormData.isActive}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Hiển thị danh mục
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Thứ tự hiển thị
                </label>
                <input
                  type="number"
                  value={categoryFormData.displayOrder}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, displayOrder: Number(e.target.value) })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Nhập số thứ tự"
                  min="0"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang xử lý...' : editingCategory ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Items Filter */}
      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tất cả
        </button>
        {categories.map((category) => (
          <button
            key={category._id || category.id}
            onClick={() => setSelectedCategory(String(category._id || category.id))}
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === String(category._id || category.id)
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Menu Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <span className="font-medium text-green-600">${item.price.toFixed(2)}</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {item.isAvailable ? 'Còn món' : 'Hết món'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleAvailability(item._id, item.isAvailable)}
                    className={`px-2 py-1 rounded text-xs ${
                      item.isAvailable 
                        ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {item.isAvailable ? 'Đánh dấu hết' : 'Đánh dấu còn'}
                  </button>
                  <button 
                    onClick={() => handleEditMenuItem(item)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteMenuItem(item._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Menu Item Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingMenuItem ? 'Sửa món' : 'Thêm món mới'}
              </h2>
              <button 
                onClick={() => {
                  setShowAddForm(false)
                  setEditingMenuItem(null)
                  setMenuItemFormData({
                    name: '',
                    category: '',
                    price: 0,
                    description: '',
                    image: '',
                    isAvailable: true
                  })
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleMenuItemSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên món</label>
                <input
                  type="text"
                  value={menuItemFormData.name}
                  onChange={(e) => setMenuItemFormData({ ...menuItemFormData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Nhập tên món ăn"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                <select 
                  value={menuItemFormData.category}
                  onChange={(e) => setMenuItemFormData({ ...menuItemFormData, category: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(category => (
                    <option key={category._id || category.id} value={category._id || category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Giá</label>
                <input
                  type="number"
                  value={menuItemFormData.price}
                  onChange={(e) => setMenuItemFormData({ ...menuItemFormData, price: Number(e.target.value) })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Nhập giá món ăn"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                <textarea
                  value={menuItemFormData.description}
                  onChange={(e) => setMenuItemFormData({ ...menuItemFormData, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Nhập mô tả món ăn"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hình ảnh</label>
                <input
                  type="text"
                  value={menuItemFormData.image}
                  onChange={(e) => setMenuItemFormData({ ...menuItemFormData, image: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Nhập URL hình ảnh"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={menuItemFormData.isAvailable}
                  onChange={(e) => setMenuItemFormData({ ...menuItemFormData, isAvailable: e.target.checked })}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded"
                />
                <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                  Còn món
                </label>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingMenuItem(null)
                    setMenuItemFormData({
                      name: '',
                      category: '',
                      price: 0,
                      description: '',
                      image: '',
                      isAvailable: true
                    })
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang xử lý...' : editingMenuItem ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 
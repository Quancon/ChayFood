'use client'

import { useState, useEffect, useCallback } from 'react'
import { orderService, Order } from '../../services/orderService'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState('')

  // Fetch orders based on current filters
  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      let result: Order[] = []
      
      if (statusFilter) {
        result = await orderService.filterByStatus(statusFilter as Order["status"])
      } else if (searchQuery) {
        result = await orderService.search(searchQuery)
      } else {
        result = await orderService.getAll()
      }
      
      setOrders(result)
      setError('')
    } catch (err: unknown) {
      console.error('Failed to fetch orders:', err)
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchQuery])

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Handle status change
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value)
    setTimeout(() => {
      fetchOrders()
    }, 100)
  }

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    if (e.target.value === '') {
      setTimeout(() => {
        fetchOrders()
      }, 100)
    }
  }

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchOrders()
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  // Get status display
  const getStatusDisplay = (status: Order['status']) => {
    const statusMap: Record<Order['status'], { label: string, className: string }> = {
      'pending': { label: 'Đang xử lý', className: 'bg-yellow-100 text-yellow-800' },
      'confirmed': { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-800' },
      'preparing': { label: 'Đang chuẩn bị', className: 'bg-orange-100 text-orange-800' },
      'ready': { label: 'Sẵn sàng', className: 'bg-purple-100 text-purple-800' },
      'delivering': { label: 'Đang giao', className: 'bg-indigo-100 text-indigo-800' },
      'delivered': { label: 'Đã giao', className: 'bg-green-100 text-green-800' },
      'cancelled': { label: 'Đã hủy', className: 'bg-red-100 text-red-800' }
    }
    return statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
  }

  // Handle cancel order
  const handleCancelOrder = async (orderId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      const success = await orderService.cancelOrder(orderId);
      if (success) {
        fetchOrders();
      }
    }
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Quản lý đơn hàng</h1>
        <div className="flex gap-4">
          <form onSubmit={handleSearchSubmit} className="flex">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Tìm kiếm đơn hàng..."
              className="px-4 py-2 border rounded-lg"
            />
            <button type="submit" className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-lg">
              Tìm
            </button>
          </form>
          <select 
            className="px-4 py-2 border rounded-lg"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Đang xử lý</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="preparing">Đang chuẩn bị</option>
            <option value="ready">Sẵn sàng</option>
            <option value="delivering">Đang giao</option>
            <option value="delivered">Đã giao</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Không có đơn hàng nào.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap">#{order._id.slice(-6)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {typeof order.user === 'object' ? order.user.name : 'Người dùng không xác định'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusDisplay(order.status).className}`}>
                      {getStatusDisplay(order.status).label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Chi tiết
                    </button>
                    {['pending', 'confirmed'].includes(order.status) && (
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        Hủy
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 
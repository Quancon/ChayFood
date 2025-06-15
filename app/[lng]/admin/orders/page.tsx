'use client'

import { useState, useEffect, useCallback } from 'react'
import { orderService } from '@/[lng]/(default)/services/orderService'
import { userService, UserProfile } from '@/[lng]/(default)/services/userService'
import Link from 'next/link'
import { Order } from '@/lib/services/types'

// Add UserProfile type definition if not globally available
// For demonstration, let's assume it looks like this. 
// In a real app, this should be in a shared types file.
// export interface UserProfile {
//   _id: string;
//   name: string;
//   email: string;
// }

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({})
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState('')

  // Fetch orders and associated user data
  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError('')
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

      // Extract unique user IDs from orders
      const userIds = result
        .map(order => order.user)
        .filter((user): user is string => typeof user === 'string')
      
      const uniqueUserIds = Array.from(new Set(userIds));
      
      // Fetch profiles for users not already fetched
      const newUserIds = uniqueUserIds.filter(id => !userProfiles[id]);
      if (newUserIds.length > 0) {
        const fetchedProfiles = await Promise.all(
          newUserIds.map(id => userService.getUserById(id).catch(err => {
            console.error(`Failed to fetch user ${id}:`, err);
            return null; // Return null on error to not break Promise.all
          }))
        );

        const newProfiles: Record<string, UserProfile> = { ...userProfiles };
        fetchedProfiles.forEach(profile => {
          if (profile) {
            newProfiles[profile._id] = profile;
          }
        });
        setUserProfiles(newProfiles);
      }
      
    } catch (err: unknown) {
      console.error('Failed to fetch orders:', err)
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchQuery, userProfiles]) // Added userProfiles to dependency array

  // Initial fetch
  useEffect(() => {
    fetchOrders()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchQuery]) // fetchOrders is not included to avoid re-running on userProfiles change

  // Handle status change
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchQuery(''); // Clear search when filtering
    setStatusFilter(e.target.value)
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatusFilter(''); // Clear filter when searching
    fetchOrders()
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  // Get customer name from order, falling back to profile
  const getCustomerName = (order: Order): string => {
    if (typeof order.user === 'object' && order.user !== null && 'name' in order.user) {
      return order.user.name || 'Khách hàng';
    } 
    if (typeof order.user === 'string' && userProfiles[order.user]) {
      return userProfiles[order.user].name || 'Khách hàng';
    }
    return 'Khách hàng';
  }

  // Get status display properties
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

  // Handle cancelling an order
  const handleCancelOrder = async (orderId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      const success = await orderService.cancelOrder(orderId);
      if (success) {
        // Refresh orders list
        fetchOrders();
      } else {
        alert('Không thể hủy đơn hàng. Vui lòng thử lại.');
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Quản lý đơn hàng</h1>
      </div>
      
      <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg">
          <form onSubmit={handleSearchSubmit} className="flex-grow flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Tìm theo mã, tên, email..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Tìm
            </button>
          </form>
          <div className="ml-4">
            <select 
              className="px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h3 className="text-lg font-medium">Không có đơn hàng nào</h3>
          <p className="text-gray-500 mt-2">Không tìm thấy đơn hàng nào khớp với tìm kiếm của bạn.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã ĐH
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order._id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getCustomerName(order)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusDisplay(order.status).className}`}>
                      {getStatusDisplay(order.status).label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/admin/orders/${order._id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Chi tiết
                    </Link>
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
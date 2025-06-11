'use client'

import { useState, useEffect } from 'react'
import { customerService } from '../../../lib/services'
import { Customer } from '../../../lib/services/types'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const itemsPerPage = 10
  const router = useRouter()

  const fetchCustomers = async (page = 1, search = '') => {
    setLoading(true)
    try {
      const response = await customerService.getCustomers(page, itemsPerPage, search)
      if (response.success) {
        setCustomers(response.data)
        setTotalCustomers(response.total)
      } else {
        toast.error(response.message || 'Failed to fetch customers')
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('An error occurred while fetching customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers(currentPage, searchTerm)
  }, [currentPage, searchTerm])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchCustomers(1, searchTerm)
  }

  const handleDeleteCustomer = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await customerService.deleteCustomer(id)
        if (response.success) {
          toast.success('Customer deleted successfully')
          fetchCustomers(currentPage, searchTerm)
        } else {
          toast.error(response.message || 'Failed to delete customer')
        }
      } catch (error) {
        console.error('Error deleting customer:', error)
        toast.error('An error occurred while deleting the customer')
      }
    }
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Quản lý khách hàng</h1>
        <div className="flex gap-4">
          <div className="flex">
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              className="px-4 py-2 border rounded-l-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
              onClick={handleSearch}
            >
              Tìm
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số điện thoại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng chi tiêu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tham gia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers && customers.length > 0 ? (
                  customers.map((customer) => (
                    <tr key={customer._id}>
                      <td className="px-6 py-4 whitespace-nowrap">#{customer._id.substring(0, 8)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{customer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{customer.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{customer.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{customer.totalOrders}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.totalSpent != null && !isNaN(customer.totalSpent)
                          ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(customer.totalSpent)
                          : '0 ₫'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(customer.joinDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                          onClick={() => router.push(`/admin/customers/${customer._id}`)}
                        >
                          Chi tiết
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteCustomer(customer._id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      Không tìm thấy khách hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalCustomers > itemsPerPage && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center">
                <button
                  className="px-3 py-1 rounded-md mr-2 bg-gray-100 disabled:opacity-50"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </button>
                <span className="mx-4">
                  Trang {currentPage} / {Math.ceil(totalCustomers / itemsPerPage)}
                </span>
                <button
                  className="px-3 py-1 rounded-md ml-2 bg-gray-100 disabled:opacity-50"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(totalCustomers / itemsPerPage)))}
                  disabled={currentPage >= Math.ceil(totalCustomers / itemsPerPage)}
                >
                  Sau
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  )
} 
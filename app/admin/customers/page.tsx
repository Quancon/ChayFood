'use client'

import { useState } from 'react'

export default function CustomersPage() {
  const [customers] = useState([
    { 
      id: 1, 
      name: 'Nguyễn Văn A', 
      email: 'nguyenvana@email.com',
      phone: '0901234567',
      totalOrders: 5,
      totalSpent: 1250000,
      joinDate: '2024-01-15'
    },
    { 
      id: 2, 
      name: 'Trần Thị B', 
      email: 'tranthib@email.com',
      phone: '0907654321',
      totalOrders: 3,
      totalSpent: 750000,
      joinDate: '2024-02-20'
    },
    // Add more sample data as needed
  ])

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Quản lý khách hàng</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng..."
            className="px-4 py-2 border rounded-lg"
          />
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
            Thêm khách hàng
          </button>
        </div>
      </div>

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
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-6 py-4 whitespace-nowrap">#{customer.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{customer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{customer.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{customer.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">{customer.totalOrders}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(customer.totalSpent)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{customer.joinDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                    Chi tiết
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 
'use client'

import { useState } from 'react'

export default function RevenuePage() {
  const [revenueStats] = useState({
    totalRevenue: 25000000,
    monthlyRevenue: 8500000,
    weeklyRevenue: 2500000,
    dailyRevenue: 450000,
    orderCount: 150,
    averageOrderValue: 350000
  })

  const [topProducts] = useState([
    { name: 'Cơm chay thập cẩm', revenue: 5000000, orders: 50 },
    { name: 'Phở chay', revenue: 3500000, orders: 35 },
    { name: 'Bún huế chay', revenue: 2800000, orders: 28 },
  ])

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-6">Thống kê doanh thu</h1>
        
        {/* Revenue Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Tổng doanh thu</h3>
            <p className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenueStats.totalRevenue)}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Doanh thu tháng này</h3>
            <p className="text-2xl font-bold text-blue-600">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenueStats.monthlyRevenue)}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Số đơn hàng</h3>
            <p className="text-2xl font-bold text-purple-600">{revenueStats.orderCount}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Giá trị đơn trung bình</h3>
            <p className="text-2xl font-bold text-orange-600">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenueStats.averageOrderValue)}
            </p>
          </div>
        </div>

        {/* Time Period Filter */}
        <div className="flex gap-4 mb-8">
          <select className="px-4 py-2 border rounded-lg">
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="year">Năm nay</option>
          </select>
          
          <input
            type="date"
            className="px-4 py-2 border rounded-lg"
          />
          <input
            type="date"
            className="px-4 py-2 border rounded-lg"
          />
          
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Áp dụng
          </button>
        </div>

        {/* Top Products Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Sản phẩm bán chạy</h2>
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doanh thu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số đơn hàng
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.map((product, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 
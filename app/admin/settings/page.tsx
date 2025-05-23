'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [generalSettings, setGeneralSettings] = useState({
    storeName: 'Chayfood',
    storeEmail: 'info@chayfood.vn',
    phoneNumber: '(+84) 932 788 120',
    address: '33 Đường 14, KDC Bình Hưng, Ấp 2, Huyện Bình Chánh, TPHCM',
    currency: 'VND',
    language: 'vi'
  })

  const [deliverySettings, setDeliverySettings] = useState({
    minimumOrder: 100000,
    deliveryFee: 15000,
    freeDeliveryThreshold: 300000,
    maxDeliveryDistance: 10
  })

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle general settings update
    console.log('Updating general settings:', generalSettings)
  }

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle delivery settings update
    console.log('Updating delivery settings:', deliverySettings)
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-semibold mb-6">Cài đặt hệ thống</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* General Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Cài đặt chung</h2>
          <form onSubmit={handleGeneralSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tên cửa hàng
                </label>
                <input
                  type="text"
                  value={generalSettings.storeName}
                  onChange={(e) => setGeneralSettings({...generalSettings, storeName: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={generalSettings.storeEmail}
                  onChange={(e) => setGeneralSettings({...generalSettings, storeEmail: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={generalSettings.phoneNumber}
                  onChange={(e) => setGeneralSettings({...generalSettings, phoneNumber: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Địa chỉ
                </label>
                <textarea
                  value={generalSettings.address}
                  onChange={(e) => setGeneralSettings({...generalSettings, address: e.target.value})}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Đơn vị tiền tệ
                </label>
                <select
                  value={generalSettings.currency}
                  onChange={(e) => setGeneralSettings({...generalSettings, currency: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ngôn ngữ
                </label>
                <select
                  value={generalSettings.language}
                  onChange={(e) => setGeneralSettings({...generalSettings, language: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Lưu cài đặt
              </button>
            </div>
          </form>
        </div>

        {/* Delivery Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Cài đặt giao hàng</h2>
          <form onSubmit={handleDeliverySubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Đơn hàng tối thiểu
                </label>
                <input
                  type="number"
                  value={deliverySettings.minimumOrder}
                  onChange={(e) => setDeliverySettings({...deliverySettings, minimumOrder: Number(e.target.value)})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phí giao hàng
                </label>
                <input
                  type="number"
                  value={deliverySettings.deliveryFee}
                  onChange={(e) => setDeliverySettings({...deliverySettings, deliveryFee: Number(e.target.value)})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Miễn phí giao hàng cho đơn từ
                </label>
                <input
                  type="number"
                  value={deliverySettings.freeDeliveryThreshold}
                  onChange={(e) => setDeliverySettings({...deliverySettings, freeDeliveryThreshold: Number(e.target.value)})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Khoảng cách giao hàng tối đa (km)
                </label>
                <input
                  type="number"
                  value={deliverySettings.maxDeliveryDistance}
                  onChange={(e) => setDeliverySettings({...deliverySettings, maxDeliveryDistance: Number(e.target.value)})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Lưu cài đặt giao hàng
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 
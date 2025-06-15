'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { orderService } from '@/[lng]/(default)/services/orderService'
import { userService, UserProfile } from '@/[lng]/(default)/services/userService'
import { 
  CheckCircleIcon, 
  ClockIcon, 
  TruckIcon, 
  XCircleIcon, 
  ArrowLeftIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  UserIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import React from 'react'
import { Order } from '@/lib/services/types'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  
  const [order, setOrder] = useState<Order | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingStatus, setProcessingStatus] = useState(false)

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true)
      try {
        const data = await orderService.getById(orderId)
        if (data) {
          setOrder(data)
          
          // If user is just an ID, fetch user details
          if (data.user && typeof data.user === 'string') {
            try {
              const userProfileData = await userService.getUserById(data.user)
              if (userProfileData) {
                setUserProfile(userProfileData)
              }
            } catch (userErr) {
              console.error('Failed to fetch user details:', userErr)
            }
          }
          
          setError('')
        } else {
          setError('Không tìm thấy thông tin đơn hàng.')
        }
      } catch (err) {
        console.error('Failed to fetch order details:', err)
        setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get customer name
  const getCustomerName = (): string => {
    if (!order) return 'Khách hàng';
    
    if (typeof order.user === 'object' && order.user !== null) {
      return order.user.name || 'Không có tên';
    } else if (userProfile) {
      return userProfile.name || 'Không có tên';
    }
    
    return 'Khách hàng';
  }

  // Get customer email
  const getCustomerEmail = (): string => {
    if (!order) return '';
    
    if (typeof order.user === 'object' && order.user !== null) {
      return order.user.email || '';
    } else if (userProfile) {
      return userProfile.email || '';
    }
    
    return '';
  }

  // Get customer phone
  const getCustomerPhone = (): string => {
    // First try to get phone from user profile addresses
    if (userProfile && userProfile.addresses && userProfile.addresses.length > 0) {
      // Try to find default address first
      const defaultAddress = userProfile.addresses.find(addr => addr.isDefault);
      if (defaultAddress && defaultAddress.phone) {
        return defaultAddress.phone;
      }
      
      // If no default address with phone, use the first address with a phone
      const addressWithPhone = userProfile.addresses.find(addr => addr.phone);
      if (addressWithPhone) {
        return addressWithPhone.phone;
      }
    }
    
    // Fallback to user profile phone if exists
    if (userProfile && userProfile.phone) {
      return userProfile.phone;
    }
    
    return '';
  }

  // Get item name
  const getItemName = (item: Order['items'][0]): string => {
    if (typeof item.menuItem === 'object' && item.menuItem !== null) {
      if (typeof item.menuItem.name === 'string') {
        return item.menuItem.name;
      } else if (typeof item.menuItem.name === 'object') {
        return item.menuItem.name.vi || item.menuItem.name.en || 'Không có tên';
      }
    }
    return 'Món ăn';
  }

  // Get item image
  const getItemImage = (item: Order['items'][0]): string => {
    if (typeof item.menuItem === 'object' && item.menuItem !== null && item.menuItem.image) {
      return item.menuItem.image;
    }
    return '/assets/placeholder-food.jpg';
  }

  // Update order status
  const updateOrderStatus = async (status: Order['status']) => {
    if (!order) return;
    
    setProcessingStatus(true)
    try {
      const updatedOrder = await orderService.updateStatus(orderId, status)
      if (updatedOrder) {
        setOrder(updatedOrder)
      } else {
        setError('Không thể cập nhật trạng thái đơn hàng.')
      }
    } catch (err) {
      console.error('Failed to update order status:', err)
      setError('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.')
    } finally {
      setProcessingStatus(false)
    }
  }

  // Get status display
  const getStatusDisplay = (status: Order['status']) => {
    const statusMap: Record<Order['status'], { label: string, className: string, icon: React.ReactNode }> = {
      'pending': { 
        label: 'Đang xử lý', 
        className: 'bg-yellow-100 text-yellow-800',
        icon: <ClockIcon className="h-5 w-5" />
      },
      'confirmed': { 
        label: 'Đã xác nhận', 
        className: 'bg-blue-100 text-blue-800',
        icon: <CheckCircleIcon className="h-5 w-5" />
      },
      'preparing': { 
        label: 'Đang chuẩn bị', 
        className: 'bg-orange-100 text-orange-800',
        icon: <ClockIcon className="h-5 w-5" />
      },
      'ready': { 
        label: 'Sẵn sàng', 
        className: 'bg-purple-100 text-purple-800',
        icon: <ShoppingBagIcon className="h-5 w-5" />
      },
      'delivering': { 
        label: 'Đang giao', 
        className: 'bg-indigo-100 text-indigo-800',
        icon: <TruckIcon className="h-5 w-5" />
      },
      'delivered': { 
        label: 'Đã giao', 
        className: 'bg-green-100 text-green-800',
        icon: <CheckCircleIcon className="h-5 w-5" />
      },
      'cancelled': { 
        label: 'Đã hủy', 
        className: 'bg-red-100 text-red-800',
        icon: <XCircleIcon className="h-5 w-5" />
      }
    }
    return statusMap[status] || { 
      label: status, 
      className: 'bg-gray-100 text-gray-800',
      icon: <ClockIcon className="h-5 w-5" />
    }
  }

  // Get payment status display
  const getPaymentStatusDisplay = (status: Order['paymentStatus']) => {
    const statusMap: Record<Order['paymentStatus'], { label: string, className: string }> = {
      'pending': { label: 'Chờ thanh toán', className: 'bg-yellow-100 text-yellow-800' },
      'paid': { label: 'Đã thanh toán', className: 'bg-green-100 text-green-800' },
      'failed': { label: 'Thanh toán thất bại', className: 'bg-red-100 text-red-800' }
    }
    return statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
  }

  // Get payment method display
  const getPaymentMethodDisplay = (method: Order['paymentMethod']) => {
    const methodMap: Record<string, string> = {
      'cod': 'Thanh toán khi nhận hàng',
      'card': 'Thẻ tín dụng/ghi nợ',
      'banking': 'Chuyển khoản ngân hàng',
      'stripe': 'Thanh toán Stripe'
    }
    return methodMap[method] || method
  }

  // Debug function to check what data we have
  // const debugUserData = () => {
  //   console.log('Order user data:', order?.user);
  //   console.log('User profile data:', userProfile);
  //   if (userProfile?.addresses) {
  //     console.log('User addresses:', userProfile.addresses);
  //   }
  // }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        {error || 'Không tìm thấy thông tin đơn hàng.'}
        <div className="mt-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-indigo-600 hover:text-indigo-900"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" /> Quay lại
          </button>
        </div>
      </div>
    )
  }

  // Call debug function to check data
  // debugUserData();

  return (
    <div className="container mx-auto px-4 pb-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => router.back()}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold">Chi tiết đơn hàng #{order._id ? order._id.toString().slice(-6) : orderId.slice(-6)}</h1>
        </div>
        <div className="flex items-center">
          <span className={`px-3 py-1 inline-flex items-center text-sm font-medium rounded-full ${getStatusDisplay(order.status).className}`}>
            {getStatusDisplay(order.status).icon}
            <span className="ml-1">{getStatusDisplay(order.status).label}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order info and items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">Thông tin đơn hàng</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Mã đơn hàng</p>
                <p className="font-medium">#{order._id ? order._id : orderId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày đặt</p>
                <p className="font-medium">{order.createdAt ? formatDate(order.createdAt) : 'Không có thông tin'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng tiền</p>
                <p className="font-medium text-lg text-indigo-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                <p className="font-medium">{order.paymentMethod ? getPaymentMethodDisplay(order.paymentMethod) : 'Không có thông tin'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trạng thái thanh toán</p>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.paymentStatus ? getPaymentStatusDisplay(order.paymentStatus).className : 'bg-gray-100 text-gray-800'}`}>
                  {order.paymentStatus ? getPaymentStatusDisplay(order.paymentStatus).label : 'Không có thông tin'}
                </span>
              </div>
            </div>
          </div>

          {/* Order items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">Món ăn ({order.items?.length || 0})</h2>
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="flex items-center border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100 mr-4">
                      <Image
                        src={getItemImage(item)}
                        alt={getItemName(item)}
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{getItemName(item)}</p>
                      <p className="text-sm text-gray-500">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price || 0)} x {item.quantity || 1}
                      </p>
                      {item.specialInstructions && (
                        <p className="text-xs text-gray-500 mt-1">
                          Ghi chú: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((item.price || 0) * (item.quantity || 1))}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Không có món ăn nào</p>
              )}
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between">
                  <p className="font-medium">Tổng cộng</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer info and actions */}
        <div className="space-y-6">
          {/* Customer info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium">Thông tin khách hàng</h2>
            </div>
            <div className="space-y-2">
              <p><span className="text-gray-500">Tên:</span> {getCustomerName()}</p>
              {getCustomerEmail() && <p><span className="text-gray-500">Email:</span> {getCustomerEmail()}</p>}
              {getCustomerPhone() && <p><span className="text-gray-500">SĐT:</span> {getCustomerPhone()}</p>}
              {!getCustomerEmail() && !getCustomerPhone() && (
                <p className="text-gray-500 italic">Thông tin liên hệ không đầy đủ</p>
              )}
            </div>
          </div>

          {/* Delivery address */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium">Địa chỉ giao hàng</h2>
            </div>
            <div className="space-y-2">
              {order.deliveryAddress ? (
                <>
                  <p>{order.deliveryAddress.street || 'Không có thông tin'}</p>
                  <p>
                    {[
                      order.deliveryAddress.city,
                      order.deliveryAddress.state,
                      order.deliveryAddress.postalCode
                    ].filter(Boolean).join(', ') || 'Không có thông tin chi tiết'}
                  </p>
                  {order.deliveryAddress.additionalInfo && (
                    <p className="text-gray-500">{order.deliveryAddress.additionalInfo}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Không có địa chỉ giao hàng</p>
              )}
              {getCustomerPhone() && (
                <p className="text-gray-500">SĐT: {getCustomerPhone()}</p>
              )}
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium">Thông tin thanh toán</h2>
            </div>
            <div className="space-y-2">
              <p><span className="text-gray-500">Phương thức:</span> {getPaymentMethodDisplay(order.paymentMethod)}</p>
              <p>
                <span className="text-gray-500">Trạng thái:</span> 
                <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.paymentStatus ? getPaymentStatusDisplay(order.paymentStatus).className : 'bg-gray-100 text-gray-800'}`}>
                  {order.paymentStatus ? getPaymentStatusDisplay(order.paymentStatus).label : 'Không có thông tin'}
                </span>
              </p>
              <p><span className="text-gray-500">Tổng tiền:</span> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount || 0)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">Hành động</h2>
            <div className="space-y-3">
              {order.status === 'pending' && (
                <button
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  onClick={() => updateOrderStatus('confirmed')}
                  disabled={processingStatus}
                >
                  {processingStatus ? 'Đang xử lý...' : 'Xác nhận đơn hàng'}
                </button>
              )}
              
              {order.status === 'confirmed' && (
                <button
                  className="w-full py-2 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-orange-300"
                  onClick={() => updateOrderStatus('preparing')}
                  disabled={processingStatus}
                >
                  {processingStatus ? 'Đang xử lý...' : 'Bắt đầu chuẩn bị'}
                </button>
              )}
              
              {order.status === 'preparing' && (
                <button
                  className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300"
                  onClick={() => updateOrderStatus('ready')}
                  disabled={processingStatus}
                >
                  {processingStatus ? 'Đang xử lý...' : 'Đánh dấu sẵn sàng'}
                </button>
              )}
              
              {order.status === 'ready' && (
                <button
                  className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                  onClick={() => updateOrderStatus('delivering')}
                  disabled={processingStatus}
                >
                  {processingStatus ? 'Đang xử lý...' : 'Bắt đầu giao hàng'}
                </button>
              )}
              
              {order.status === 'delivering' && (
                <button
                  className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
                  onClick={() => updateOrderStatus('delivered')}
                  disabled={processingStatus}
                >
                  {processingStatus ? 'Đang xử lý...' : 'Đánh dấu đã giao'}
                </button>
              )}
              
              {['pending', 'confirmed'].includes(order.status) && (
                <button
                  className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300"
                  onClick={() => updateOrderStatus('cancelled')}
                  disabled={processingStatus}
                >
                  {processingStatus ? 'Đang xử lý...' : 'Hủy đơn hàng'}
                </button>
              )}
              
              {['delivered', 'cancelled'].includes(order.status) && (
                <p className="text-center text-gray-500">Đơn hàng đã hoàn tất hoặc đã bị hủy.</p>
              )}

              {/* Nếu không có trạng thái hợp lệ */}
              {!['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'].includes(order.status || '') && (
                <div className="text-center py-2 px-4 bg-yellow-100 text-yellow-800 rounded-md">
                  Trạng thái đơn hàng không xác định: {order.status || 'không có'}
                </div>
              )}
            </div>
          </div>
          
          {order.specialInstructions && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-2">Ghi chú đơn hàng</h2>
              <p className="text-gray-600">{order.specialInstructions}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
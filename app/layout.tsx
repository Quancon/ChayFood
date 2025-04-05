import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from './components/navbar'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { Toaster } from 'react-hot-toast'
import { ChatAgent } from '@/components/chat/chat-agent'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chayfood - Vegan Food Delivery',
  description: 'Healthy and delicious vegan food delivered to your door',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="pt-20">
              {children}
            </main>
            <footer className="bg-gray-900 text-white py-12">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4">Công ty TNHH Chayfood</h3>
                    <p className="text-gray-400">33 Đường 14, KDC Bình Hưng, Ấp 2, Huyện Bình Chánh, TPHCM</p>
                    <p className="text-gray-400">Điện thoại: (+84) 932 788 120</p>
                    <p className="text-gray-400">Email: info@chayfood.vn</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4">Điều khoản chung</h3>
                    <ul className="space-y-2">
                      <li><a href="#" className="text-gray-400 hover:text-white">Chính Sách Quy Định Chung</a></li>
                      <li><a href="#" className="text-gray-400 hover:text-white">Quy Định Hình Thức Thanh Toán</a></li>
                      <li><a href="#" className="text-gray-400 hover:text-white">Chính Sách Vận Chuyển</a></li>
                      <li><a href="#" className="text-gray-400 hover:text-white">Chính Sách Bảo Mật</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4">Theo dõi chúng tôi</h3>
                    <div className="flex space-x-4">
                      <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
                      <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
                      <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4">Newsletter</h3>
                    <p className="text-gray-400 mb-4">Đăng ký nhận thông tin khuyến mãi</p>
                    <div className="flex">
                      <input type="email" placeholder="Email của bạn" className="px-4 py-2 rounded-l-md w-full" />
                      <button className="bg-green-600 text-white px-4 py-2 rounded-r-md hover:bg-green-700">
                        Đăng ký
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
                  © Copyright 2025 Chayfood. All rights reserved.
                </div>
              </div>
            </footer>
            <Toaster position="top-center" />
            <ChatAgent />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 
import './globals.css'
import { Inter } from 'next/font/google'
import MobileNav from './components/MobileNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Chayfood - Healthy Meal Plans',
  description: 'Fresh, healthy meal plans delivered to your door',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="fixed top-0 w-full bg-white shadow-md z-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <a href="/" className="text-2xl font-bold text-green-600">CHAY FOOD</a>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="/menu" className="text-gray-700 hover:text-green-600">Thực đơn</a>
                <a href="/party" className="text-gray-700 hover:text-green-600">Đặt tiệc</a>
                <a href="/order" className="text-gray-700 hover:text-green-600">Đặt hàng</a>
                <a href="/news" className="text-gray-700 hover:text-green-600">Tin tức</a>
                <a href="/faqs" className="text-gray-700 hover:text-green-600">FAQs</a>
                <div className="flex items-center space-x-4">
                  <a href="/login" className="text-gray-700 hover:text-green-600">Đăng nhập</a>
                  <a href="/register" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                    Đăng ký
                  </a>
                </div>
              </div>
              <MobileNav />
            </div>
          </div>
        </nav>
        <main className="pt-16">
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
      </body>
    </html>
  )
} 
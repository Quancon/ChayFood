"use client"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { href: '/menu', label: 'Thực đơn' },
    { href: '/party', label: 'Đặt tiệc' },
    { href: '/order', label: 'Đặt hàng' },
    { href: '/news', label: 'Tin tức' },
    { href: '/faqs', label: 'FAQs' },
  ]

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 right-0 bg-white shadow-lg"
          >
            <div className="px-4 py-2">
              {menuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block py-2 text-gray-700 hover:text-green-600"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="border-t border-gray-200 mt-2 pt-2">
                <a
                  href="/login"
                  className="block py-2 text-gray-700 hover:text-green-600"
                  onClick={() => setIsOpen(false)}
                >
                  Đăng nhập
                </a>
                <a
                  href="/register"
                  className="block py-2 text-green-600 font-semibold hover:text-green-700"
                  onClick={() => setIsOpen(false)}
                >
                  Đăng ký
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 
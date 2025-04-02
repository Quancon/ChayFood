"use client"
import { motion } from 'framer-motion'
import Image from 'next/image'

const categories = [
  {
    id: 1,
    name: "Món chay",
    description: "Các món ăn chay truyền thống",
    image: "/menu/vegan-traditional.jpg"
  },
  {
    id: 2,
    name: "Salad",
    description: "Salad tươi và healthy",
    image: "/menu/salad.jpg"
  },
  {
    id: 3,
    name: "Soup & Cháo",
    description: "Súp và cháo dinh dưỡng",
    image: "/menu/soup.jpg"
  },
  {
    id: 4,
    name: "Đồ uống",
    description: "Nước ép & Sinh tố",
    image: "/menu/drinks.jpg"
  }
]

const menuItems = [
  {
    id: 1,
    name: "Cơm Gạo Lứt Rau Củ",
    description: "Cơm gạo lứt với các loại rau củ theo mùa",
    price: "65.000đ",
    category: "Món chay",
    image: "/menu/brown-rice.jpg",
    isPopular: true
  },
  {
    id: 2,
    name: "Salad Quinoa",
    description: "Salad quinoa với bơ và rau củ",
    price: "85.000đ",
    category: "Salad",
    image: "/menu/quinoa-salad.jpg",
    isPopular: true
  },
  {
    id: 3,
    name: "Súp Bí Đỏ",
    description: "Súp bí đỏ kem thực vật",
    price: "55.000đ",
    category: "Soup & Cháo",
    image: "/menu/pumpkin-soup.jpg",
    isPopular: false
  }
]

export default function Menu() {
  return (
    <main className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Thực đơn</h1>
          <p className="text-lg text-gray-600">Khám phá các món ăn healthy của chúng tôi</p>
        </motion.div>

        {/* Categories */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Danh mục</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group cursor-pointer"
              >
                <div className="relative h-48 rounded-lg overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300" />
                  <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-4">
                    <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                    <p className="text-sm text-center">{category.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Menu Items */}
        <section>
          <h2 className="text-2xl font-bold mb-8">Món ăn nổi bật</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="relative h-48">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  {item.isPopular && (
                    <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm">
                      Phổ biến
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{item.name}</h3>
                    <span className="text-primary font-bold">{item.price}</span>
                  </div>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{item.category}</span>
                    <button className="btn btn-primary">Đặt ngay</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
} 
"use client"
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const articles = [
  {
    id: 1,
    title: "Lợi ích của chế độ ăn thuần chay",
    excerpt: "Khám phá những lợi ích sức khỏe tuyệt vời từ việc áp dụng chế độ ăn thuần chay...",
    image: "/news/vegan-benefits.jpg",
    date: "2024-03-28",
    category: "Sức khỏe",
    readTime: "5 phút"
  },
  {
    id: 2,
    title: "Top 10 món ăn chay được yêu thích nhất",
    excerpt: "Cùng điểm qua những món ăn chay được khách hàng yêu thích nhất tại ChayFood...",
    image: "/news/top-dishes.jpg",
    date: "2024-03-25",
    category: "Ẩm thực",
    readTime: "8 phút"
  },
  {
    id: 3,
    title: "Hướng dẫn chuẩn bị bữa ăn chay cân bằng",
    excerpt: "Những tips hữu ích để chuẩn bị bữa ăn chay đầy đủ dinh dưỡng...",
    image: "/news/meal-prep.jpg",
    date: "2024-03-22",
    category: "Hướng dẫn",
    readTime: "6 phút"
  },
  {
    id: 4,
    title: "Xu hướng ẩm thực chay 2024",
    excerpt: "Cập nhật những xu hướng ẩm thực chay mới nhất trong năm 2024...",
    image: "/news/trends.jpg",
    date: "2024-03-20",
    category: "Xu hướng",
    readTime: "4 phút"
  }
]

const categories = ["Tất cả", "Sức khỏe", "Ẩm thực", "Hướng dẫn", "Xu hướng"]

export default function News() {
  return (
    <main className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Tin tức & Bài viết</h1>
          <p className="text-lg text-gray-600">
            Cập nhật thông tin mới nhất về ẩm thực chay và lối sống healthy
          </p>
        </motion.div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category, index) => (
            <motion.button
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="px-6 py-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
            >
              {category}
            </motion.button>
          ))}
        </div>

        {/* Featured Article */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="relative h-[60vh] rounded-xl overflow-hidden">
            <Image
              src="/news/featured.jpg"
              alt="Featured Article"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <span className="bg-primary px-3 py-1 rounded-full text-sm mb-4 inline-block">
                Xu hướng
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Khám phá văn hóa ẩm thực chay Việt Nam
              </h2>
              <p className="text-lg mb-4 max-w-2xl">
                Hành trình tìm hiểu về nét đẹp trong văn hóa ẩm thực chay của người Việt...
              </p>
              <div className="flex items-center space-x-4">
                <span>15 phút đọc</span>
                <span>•</span>
                <span>2024-03-30</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              <Link href={`/tin-tuc/${article.id}`}>
                <div className="relative h-48">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{article.readTime}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(article.date).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="btn btn-primary">
            Xem thêm bài viết
          </button>
        </div>
      </div>
    </main>
  )
} 
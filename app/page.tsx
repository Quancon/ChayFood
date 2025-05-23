"use client"
import { motion } from 'framer-motion'
import Image from 'next/image'
import Environmental from './components/Environmental'
import Testimonials from './components/Testimonials'
import Partners from './components/Partners'
import { useRedirectByRole } from './hooks/useRedirectByRole'

const products = [
  {
    id: 1,
    name: "Fresh Salad Bowl",
    description: "Mixed greens with quinoa, avocado, and citrus dressing",
    price: "$12.99",
    image: "/meals/meal1.jpg"
  },
  {
    id: 2,
    name: "Roasted Veggie Mix",
    description: "Seasonal vegetables roasted with herbs and olive oil",
    price: "$10.99",
    image: "/meals/meal2.jpg"
  },
  {
    id: 3,
    name: "Protein Power Bowl",
    description: "Grilled chicken with sweet potatoes and broccoli",
    price: "$14.99",
    image: "/meals/meal3.jpg"
  }
]

export default function Home() {
  // This hook will automatically redirect admin users to the admin dashboard
  useRedirectByRole({ adminRedirect: '/admin' });
  
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen-90">
        <Image
          src="/hero-bg.jpg"
          alt="Hero background"
          fill
          className="img-cover brightness-50"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center container"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Kế hoạch bữa ăn hàng tuần cho
              <br />
              một lối sống lành mạnh
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Trải nghiệm bữa ăn sạch tươi ngon giàu dinh dưỡng
            </p>
            <a href="/order" className="btn btn-primary">
              Đặt Ngay
            </a>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section bg-background-light">
        <div className="container">
          <h2 className="section-title">Sản phẩm tiêu biểu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="card"
              >
                <div className="relative h-48">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="img-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-primary font-bold">{product.price}</span>
                    <button className="btn btn-primary">
                      Đặt hàng
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Cách đặt hàng</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                title: 'Chọn Gói Ăn',
                description: 'Chọn gói ăn phù hợp với nhu cầu của bạn và điền đầy đủ thông tin giao hàng'
              },
              {
                title: 'Chayfood nấu',
                description: 'Chúng tôi lựa chọn những nguyên liệu tốt nhất và nấu trong bếp công nghiệp hiện đại'
              },
              {
                title: 'Giao hàng',
                description: 'Đội ngũ giao hàng của Chayfood sẽ giao tận nơi các phần ăn cho bạn mỗi ngày'
              },
              {
                title: 'Thưởng thức',
                description: 'Không cần suy nghĩ, shopping hay nấu nướng dầu mỡ, chỉ cần hâm và thưởng thức!'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="text-center fade-in"
              >
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Environmental Section */}
      <Environmental />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Partners and Clients Section */}
      <Partners />
    </main>
  )
} 
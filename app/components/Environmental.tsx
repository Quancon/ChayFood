import { motion } from 'framer-motion'
import Image from 'next/image'

const initiatives = [
  {
    id: 1,
    title: "Sustainable Packaging",
    description: "We use eco-friendly packaging materials that are biodegradable and recyclable.",
    icon: "/icons/leaf.svg"
  },
  {
    id: 2,
    title: "Carbon Footprint",
    description: "We actively work to reduce our carbon footprint through efficient delivery routes.",
    icon: "/icons/globe.svg"
  },
  {
    id: 3,
    title: "Zero Waste",
    description: "Our meal planning system helps minimize food waste in our operations.",
    icon: "/icons/sparkles.svg"
  }
]

export default function Environmental() {
  return (
    <section className="py-20 bg-green-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Chung tay bảo vệ
          <span className="text-green-600"> Môi trường</span>
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Chúng tôi cam kết thực hiện các sáng kiến thân thiện với môi trường để góp phần bảo vệ hành tinh của chúng ta
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {initiatives.map((initiative, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white rounded-lg p-6 shadow-md"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Image
                  src={initiative.icon}
                  alt={initiative.title}
                  width={32}
                  height={32}
                />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">
                {initiative.title}
              </h3>
              <p className="text-gray-600 text-center">
                {initiative.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="/about-us#environmental"
            className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold"
          >
            Tìm hiểu thêm về cam kết môi trường của chúng tôi
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
} 
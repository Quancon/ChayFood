"use client"
import { motion } from 'framer-motion'
import { useState } from 'react'

const faqs = [
  {
    id: 1,
    category: "Đặt hàng",
    questions: [
      {
        id: "order-1",
        question: "Làm thế nào để đặt hàng?",
        answer: "Bạn có thể đặt hàng trực tiếp trên website của chúng tôi thông qua trang Đặt hàng. Chọn gói ăn phù hợp, điền thông tin cá nhân và địa chỉ giao hàng, sau đó thanh toán để hoàn tất đơn hàng."
      },
      {
        id: "order-2",
        question: "Thời gian giao hàng là khi nào?",
        answer: "Chúng tôi giao hàng từ 6:00 - 21:00 hàng ngày. Bạn có thể chọn khung giờ giao hàng phù hợp khi đặt hàng."
      },
      {
        id: "order-3",
        question: "Có thể hủy đơn hàng không?",
        answer: "Bạn có thể hủy đơn hàng trước 4 tiếng so với thời gian giao hàng dự kiến. Vui lòng liên hệ với chúng tôi qua hotline để được hỗ trợ."
      }
    ]
  },
  {
    id: 2,
    category: "Thanh toán",
    questions: [
      {
        id: "payment-1",
        question: "Những phương thức thanh toán nào được chấp nhận?",
        answer: "Chúng tôi chấp nhận thanh toán qua thẻ ngân hàng, ví điện tử (Momo, ZaloPay), và tiền mặt khi nhận hàng."
      },
      {
        id: "payment-2",
        question: "Có được hoàn tiền nếu không hài lòng với món ăn không?",
        answer: "Chúng tôi cam kết đảm bảo chất lượng món ăn. Nếu có vấn đề về chất lượng, vui lòng liên hệ với chúng tôi trong vòng 2 giờ sau khi nhận hàng để được hỗ trợ."
      }
    ]
  },
  {
    id: 3,
    category: "Thực đơn & Dinh dưỡng",
    questions: [
      {
        id: "menu-1",
        question: "Thực đơn có được thay đổi thường xuyên không?",
        answer: "Thực đơn của chúng tôi được cập nhật hàng tuần để đảm bảo sự đa dạng và phù hợp với mùa."
      },
      {
        id: "menu-2",
        question: "Làm thế nào để biết thông tin dinh dưỡng của món ăn?",
        answer: "Thông tin dinh dưỡng chi tiết của từng món ăn được hiển thị trên trang web khi bạn chọn món."
      },
      {
        id: "menu-3",
        question: "Có thể tùy chỉnh thực đơn theo nhu cầu không?",
        answer: "Có, bạn có thể tùy chỉnh thực đơn theo nhu cầu dinh dưỡng cá nhân khi đăng ký gói Premium."
      }
    ]
  },
  {
    id: 4,
    category: "Khác",
    questions: [
      {
        id: "other-1",
        question: "Có dịch vụ tư vấn dinh dưỡng không?",
        answer: "Có, chúng tôi cung cấp dịch vụ tư vấn dinh dưỡng miễn phí cho khách hàng đăng ký gói Nâng cao và Premium."
      },
      {
        id: "other-2",
        question: "Làm thế nào để liên hệ với bộ phận hỗ trợ?",
        answer: "Bạn có thể liên hệ với chúng tôi qua hotline 1900-xxxx hoặc email support@chayfood.vn"
      }
    ]
  }
]

export default function FAQs() {
  const [openCategory, setOpenCategory] = useState<number | null>(1)
  const [openQuestions, setOpenQuestions] = useState<string[]>([])

  const toggleCategory = (categoryId: number) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId)
  }

  const toggleQuestion = (questionId: string) => {
    setOpenQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  return (
    <main className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Câu hỏi thường gặp
          </h1>
          <p className="text-lg text-gray-600">
            Tìm câu trả lời cho những thắc mắc của bạn
          </p>
        </motion.div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="max-w-3xl mx-auto">
          {faqs.map(category => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <span className="text-xl font-semibold">{category.category}</span>
                <svg
                  className={`w-6 h-6 transition-transform ${
                    openCategory === category.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {openCategory === category.id && (
                <div className="mt-4 space-y-4">
                  {category.questions.map(item => (
                    <div key={item.id} className="border rounded-lg">
                      <button
                        onClick={() => toggleQuestion(item.id)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <span className="font-medium pr-8">{item.question}</span>
                        <svg
                          className={`w-5 h-5 flex-shrink-0 transition-transform ${
                            openQuestions.includes(item.id) ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {openQuestions.includes(item.id) && (
                        <div className="px-4 pb-4">
                          <p className="text-gray-600">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-lg mb-4">
            Không tìm thấy câu trả lời bạn cần?
          </p>
          <button className="btn btn-primary">
            Liên hệ hỗ trợ
          </button>
        </motion.div>
      </div>
    </main>
  )
} 
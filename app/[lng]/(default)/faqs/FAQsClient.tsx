"use client"
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from '@/i18n/client';

export default function FAQsClient() {
  const { t } = useTranslation();

  const faqs = [
    {
      id: 1,
      category: t('faqsPage.categories.order'),
      questions: [
        {
          id: "order-1",
          question: t('faqsPage.questions.order-1.question'),
          answer: t('faqsPage.questions.order-1.answer')
        },
        {
          id: "order-2",
          question: t('faqsPage.questions.order-2.question'),
          answer: t('faqsPage.questions.order-2.answer')
        },
        {
          id: "order-3",
          question: t('faqsPage.questions.order-3.question'),
          answer: t('faqsPage.questions.order-3.answer')
        }
      ]
    },
    {
      id: 2,
      category: t('faqsPage.categories.payment'),
      questions: [
        {
          id: "payment-1",
          question: t('faqsPage.questions.payment-1.question'),
          answer: t('faqsPage.questions.payment-1.answer')
        },
        {
          id: "payment-2",
          question: t('faqsPage.questions.payment-2.question'),
          answer: t('faqsPage.questions.payment-2.answer')
        }
      ]
    },
    {
      id: 3,
      category: t('faqsPage.categories.menuNutrition'),
      questions: [
        {
          id: "menu-1",
          question: t('faqsPage.questions.menu-1.question'),
          answer: t('faqsPage.questions.menu-1.answer')
        },
        {
          id: "menu-2",
          question: t('faqsPage.questions.menu-2.question'),
          answer: t('faqsPage.questions.menu-2.answer')
        },
        {
          id: "menu-3",
          question: t('faqsPage.questions.menu-3.question'),
          answer: t('faqsPage.questions.menu-3.answer')
        }
      ]
    },
    {
      id: 4,
      category: t('faqsPage.categories.other'),
      questions: [
        {
          id: "other-1",
          question: t('faqsPage.questions.other-1.question'),
          answer: t('faqsPage.questions.other-1.answer')
        },
        {
          id: "other-2",
          question: t('faqsPage.questions.other-2.question'),
          answer: t('faqsPage.questions.other-2.answer')
        }
      ]
    }
  ]

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
            {t('faqsPage.pageTitle')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('faqsPage.pageSubtitle')}
          </p>
        </motion.div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder={t('faqsPage.searchPlaceholder')}
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
            {t('faqsPage.contactSectionTitle')}
          </p>
          <button className="btn btn-primary">
            {t('faqsPage.contactButton')}
          </button>
        </motion.div>
      </div>
    </main>
  )
} 
"use client"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { t } = useTranslation('common');

  const testimonialsData = [
    {
      id: 1,
      name: t('testimonials.name1'),
      role: t('testimonials.role1'),
      image: "/testimonials/profile1.jpg",
      content: t('testimonials.content1')
    },
    {
      id: 2,
      name: t('testimonials.name2'),
      role: t('testimonials.role2'),
      image: "/testimonials/profile2.jpg",
      content: t('testimonials.content2')
    },
    {
      id: 3,
      name: t('testimonials.name3'),
      role: t('testimonials.role3'),
      image: "/testimonials/profile3.jpg",
      content: t('testimonials.content3')
    }
  ];

  const next = () => {
    setCurrentIndex((current) => (current + 1) % testimonialsData.length)
  }

  const prev = () => {
    setCurrentIndex((current) => (current - 1 + testimonialsData.length) % testimonialsData.length)
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {t('testimonials.title')}
        </h2>
        <div className="relative max-w-4xl mx-auto">
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-50"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-50"
          >
            <svg
              className="w-6 h-6 text-gray-600"
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
          </button>

          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-8 rounded-lg text-center"
              >
                <div className="w-24 h-24 mx-auto mb-6 relative">
                  <Image
                    src={testimonialsData[currentIndex].image}
                    alt={testimonialsData[currentIndex].name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <p className="text-gray-600 text-lg mb-6 italic">
                  &quot;{testimonialsData[currentIndex].content}&quot;
                </p>
                <h3 className="font-semibold text-xl mb-1">
                  {testimonialsData[currentIndex].name}
                </h3>
                <p className="text-gray-500">{testimonialsData[currentIndex].role}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonialsData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-green-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 
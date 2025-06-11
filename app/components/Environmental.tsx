import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

interface EnvironmentalProps {
  lng: string;
}


export default function Environmental({ lng }: EnvironmentalProps) {
  const { t } = useTranslation('common');

  const initiatives = [
    {
      id: 1,
      title: t('environmental.initiative1.title'),
      description: t('environmental.initiative1.description'),
      icon: "/icons/leaf.svg"
    },
    {
      id: 2,
      title: t('environmental.initiative2.title'),
      description: t('environmental.initiative2.description'),
      icon: "/icons/globe.svg"
    },
    {
      id: 3,
      title: t('environmental.initiative3.title'),
      description: t('environmental.initiative3.description'),
      icon: "/icons/sparkles.svg"
    }
  ];

  return (
    <section className="py-20 bg-green-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          {t('environmental.titlePart1')}
          <span className="text-green-600"> {t('environmental.titlePart2')}</span>
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          {t('environmental.subtitle')}
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
          <Link
            href={`/${lng}/about-us#environmental`}
            className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold"
          >
            {t('environmental.learnMore')}
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
          </Link>
        </div>
      </div>
    </section>
  )
} 
"use client"
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next';

interface NewsClientProps {
  lng: string;
}

export default function NewsClient({ lng }: NewsClientProps) {
  const { t } = useTranslation();

  const articles = [
    {
      id: 1,
      title: t('newsPage.articles.article1.title'),
      excerpt: t('newsPage.articles.article1.excerpt'),
      image: "/news/vegan-benefits.jpg",
      date: "2024-03-28",
      category: t('newsPage.articles.article1.category'),
      readTime: "5 phút"
    },
    {
      id: 2,
      title: t('newsPage.articles.article2.title'),
      excerpt: t('newsPage.articles.article2.excerpt'),
      image: "/news/top-dishes.jpg",
      date: "2024-03-25",
      category: t('newsPage.articles.article2.category'),
      readTime: "8 phút"
    },
    {
      id: 3,
      title: t('newsPage.articles.article3.title'),
      excerpt: t('newsPage.articles.article3.excerpt'),
      image: "/news/meal-prep.jpg",
      date: "2024-03-22",
      category: t('newsPage.articles.article3.category'),
      readTime: "6 phút"
    },
    {
      id: 4,
      title: t('newsPage.articles.article4.title'),
      excerpt: t('newsPage.articles.article4.excerpt'),
      image: "/news/trends.jpg",
      date: "2024-03-20",
      category: t('newsPage.articles.article4.category'),
      readTime: "4 phút"
    }
  ]

  const categories = [t('newsPage.allCategories'), t('newsPage.articles.article1.category'), t('newsPage.articles.article2.category'), t('newsPage.articles.article3.category'), t('newsPage.articles.article4.category')]

  return (
    <main className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('newsPage.pageTitle')}</h1>
          <p className="text-lg text-gray-600">
            {t('newsPage.pageSubtitle')}
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
              alt={t('newsPage.featuredArticleTitle')}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <span className="bg-primary px-3 py-1 rounded-full text-sm mb-4 inline-block">
                {t('newsPage.featuredArticleCategory')}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t('newsPage.featuredArticleTitle')}
              </h2>
              <p className="text-lg mb-4 max-w-2xl">
                {t('newsPage.featuredArticleExcerpt')}
              </p>
              <div className="flex items-center space-x-4">
                <span>{t('newsPage.readTimeFormat', { readTime: "15 phút" })}</span>
                <span>•</span>
                <span>{new Date("2024-03-30").toLocaleDateString(lng === 'vi' ? 'vi-VN' : 'en-US')}
</span>
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
              <Link href={`/${lng}/tin-tuc/${article.id}`}>
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
                    <span>{t('newsPage.readTimeFormat', { readTime: article.readTime })}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(article.date).toLocaleDateString(lng === 'vi' ? 'vi-VN' : 'en-US')}</span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="btn btn-primary">
            {t('newsPage.loadMoreArticles')}
          </button>
        </div>
      </div>
    </main>
  )
} 
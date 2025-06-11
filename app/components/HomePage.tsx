"use client"
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion'
import Image from 'next/image'
import Environmental from './Environmental'
import Testimonials from './Testimonials'
import Partners from './Partners'
import { useRedirectByRole } from '../[lng]/hooks/useRedirectByRole'
import Link from 'next/link'
import { analyticsService } from '../[lng]/services/analyticsService'
import { MenuItemCard } from './ui/menu-item-card';
import { useTranslation } from 'react-i18next'
import { useParams } from 'next/navigation'

interface PopularDish {
  id?: string;
  _id?: string;
  name: string;
  image?: string;
  price?: number;
  revenue?: number;
  description?: string;
  ingredients?: string[];
  category?: string;
  nutritionInfo?: Record<string, number>;
  isAvailable?: boolean;
  preparationTime?: number;
  isVegetarian?: boolean;
  spicyLevel?: number;
  isBestSeller?: boolean;
  isPopular?: boolean;
}

export default function HomePage() {
  const params = useParams();
  const lng = params.lng as string || 'en';
  const { t } = useTranslation('common');

  // This hook will automatically redirect admin users to the admin dashboard
  useRedirectByRole({ adminRedirect: '/admin' });
  
  const [popularDishes, setPopularDishes] = useState<PopularDish[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [errorPopular, setErrorPopular] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPopularDishes() {
      setLoadingPopular(true);
      setErrorPopular(null);
      try {
        const data = await analyticsService.getPopularDishes();
        setPopularDishes(Array.isArray(data) ? data.slice(0, 3) : []);
      } catch {
        setErrorPopular(t('popularDishes.error'));
      } finally {
        setLoadingPopular(false);
      }
    }
    fetchPopularDishes();
  }, [t]);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen-90">
        <Image
          src="/hero-bg.jpg"
          alt="Hero background"
          className="absolute inset-0 w-full h-full object-cover brightness-50"
          fill
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center container"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6"
              dangerouslySetInnerHTML={{ __html: t('hero.title').replace(/\n/g, '<br />') }}
            />
            <p className="text-xl md:text-2xl mb-8">
              {t('hero.subtitle')}
            </p>
            <Link href={`/${lng}/order`} className="btn btn-primary">
              {t('hero.orderNow')}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      {/* <section className="section bg-background-light">
        ...phần sản phẩm bán chạy cũ...
      </section> */}

      {/* Popular Dishes Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title flex items-center gap-2">
            {t('popularDishes.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingPopular ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card animate-pulse bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-2/3 mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
                    <div className="h-8 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : errorPopular ? (
              <div className="col-span-3 text-center text-red-500">{errorPopular}</div>
            ) : popularDishes.length === 0 ? (
              <div className="col-span-3 text-center text-gray-500">{t('popularDishes.noData')}</div>
            ) : (
              popularDishes.map((dish, idx) => {
                // Map popularDish về MenuItemCard props
                const menuItem = {
                  _id: dish.id || dish._id || `popular-${idx}`,
                  name: dish.name,
                  image: dish.image || '/meals/meal1.jpg',
                  price: dish.price || dish.revenue || 0,
                  description: dish.description || '',
                  ingredients: dish.ingredients || [],
                  category: (['main', 'side', 'dessert', 'beverage'].includes(String(dish.category))
                    ? dish.category
                    : 'main') as 'main' | 'side' | 'dessert' | 'beverage',
                  nutritionInfo: {
                    calories: dish.nutritionInfo?.calories ?? 0,
                    protein: dish.nutritionInfo?.protein ?? 0,
                    carbs: dish.nutritionInfo?.carbs ?? 0,
                    fat: dish.nutritionInfo?.fat ?? 0,
                  },
                  isAvailable: dish.isAvailable !== undefined ? dish.isAvailable : true,
                  preparationTime: dish.preparationTime || 0,
                  isBestSeller: true,
                  isPopular: true,
                  isVegetarian: dish.isVegetarian !== undefined ? dish.isVegetarian : true,
                  spicyLevel: dish.spicyLevel || 0,
                };
                return (
                  <MenuItemCard key={menuItem._id} item={menuItem} lng={lng} />
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">
            {t('howItWorks.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                title: t('howItWorks.step1.title'),
                description: t('howItWorks.step1.description')
              },
              {
                title: t('howItWorks.step2.title'),
                description: t('howItWorks.step2.description')
              },
              {
                title: t('howItWorks.step3.title'),
                description: t('howItWorks.step3.description')
              },
              {
                title: t('howItWorks.step4.title'),
                description: t('howItWorks.step4.description')
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
      <Environmental lng={lng} />

      {/* Testimonials Section */}
      <Testimonials  />

      {/* Partners and Clients Section */}
      <Partners  />
    </main>
  )
} 
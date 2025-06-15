"use client"
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface SubscriptionPageClientProps {
  lng: string;
}

const mealPlans = [
  {
    id: 1,
    name: "Gói Cơ bản",
    price: "1.200.000đ",
    duration: "1 tuần",
    mealsPerDay: 2,
    features: [
      "2 bữa ăn mỗi ngày",
      "Menu đa dạng",
      "Giao hàng tận nơi",
      "Hỗ trợ dinh dưỡng cơ bản"
    ]
  },
  {
    id: 2,
    name: "Gói Nâng cao",
    price: "2.100.000đ",
    duration: "1 tuần",
    mealsPerDay: 3,
    features: [
      "3 bữa ăn mỗi ngày",
      "Menu cao cấp",
      "Giao hàng tận nơi",
      "Tư vấn dinh dưỡng",
      "Thực đơn tùy chỉnh"
    ],
    recommended: true
  },
  {
    id: 3,
    name: "Gói Premium",
    price: "2.800.000đ",
    duration: "1 tuần",
    mealsPerDay: 3,
    features: [
      "3 bữa ăn + 2 bữa phụ",
      "Menu đặc biệt",
      "Giao hàng ưu tiên",
      "Tư vấn dinh dưỡng 1-1",
      "Thực đơn hoàn toàn tùy chỉnh",
      "Hỗ trợ 24/7"
    ]
  }
]

export default function SubscriptionPageClient({ lng }: SubscriptionPageClientProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    note: ''
  })

  const steps = [
    t('subscriptions.steps.choosePlan'),
    t('subscriptions.steps.personalInfo'),
    t('subscriptions.steps.confirmation')
  ];

  const handlePlanSelect = (planId: number) => {
    setSelectedPlan(planId)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(current => current + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(current => current - 1)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleNext()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const selectedPlanDetails = mealPlans.find(p => p.id === selectedPlan);
  // const totalAmount = selectedPlanDetails ? parseFloat(selectedPlanDetails.price.replace('đ', '').replace('.', '')) : 0;

  return (
    <main className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-center items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${index <= currentStep ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-1 mx-2 ${
                    index < currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <p className="text-lg font-medium">{steps[currentStep]}</p>
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="max-w-4xl mx-auto"
        >
          {currentStep === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {mealPlans.map(plan => (
                <div
                  key={plan.id}
                  className={`
                    relative p-6 rounded-lg border-2 cursor-pointer transition-all
                    ${selectedPlan === plan.id
                      ? 'border-primary shadow-lg'
                      : 'border-gray-200 hover:border-primary'}
                  `}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-white text-sm px-3 py-1 rounded-full">
                        {t('subscriptions.recommended')}
                      </span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-center mb-4">{plan.name}</h3>
                  <p className="text-3xl font-bold text-primary text-center mb-4">
                    {plan.price}
                    <span className="text-sm text-gray-600 font-normal">/{plan.duration} {t('subscriptions.duration')}</span>
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {currentStep === 1 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('subscriptions.form.fullName')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('subscriptions.form.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('subscriptions.form.phone')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('subscriptions.form.deliveryAddress')}
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('subscriptions.form.note')}
                </label>
                <textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-6">{t('subscriptions.confirmation.title')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between py-4 border-b">
                  <span className="font-medium">{t('subscriptions.confirmation.selectedPlan')}</span>
                  <span>{selectedPlanDetails?.name}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium">{t('subscriptions.confirmation.name')}</span>
                  <span>{formData.name}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium">{t('subscriptions.confirmation.email')}</span>
                  <span>{formData.email}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium">{t('subscriptions.confirmation.phone')}</span>
                  <span>{formData.phone}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium">{t('subscriptions.confirmation.address')}</span>
                  <span>{formData.address}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium">{t('subscriptions.confirmation.note')}</span>
                  <span>{formData.note || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-4 border-t border-gray-200 mt-4 pt-4 text-xl font-bold">
                  <span>{t('subscriptions.confirmation.totalAmount')}</span>
                  <span>{selectedPlanDetails?.price}</span>
                </div>
              </div>
              <div className="mt-8 text-center">
                <p className="text-lg font-semibold text-green-600 mb-4">{t('subscriptions.successTitle')}</p>
                <p className="text-gray-600 mb-6">{t('subscriptions.successMessage')}</p>
                <Link href={`/${lng}`}>
                  <Button className="bg-green-500 text-white hover:bg-green-600">
                    {t('subscriptions.returnToHome')}
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 0 && (
              <Button onClick={handleBack} variant="outline">
                {t('subscriptions.backButton')}
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button onClick={handleNext} className="bg-primary text-white">
                {t('subscriptions.nextButton')}
              </Button>
            )}
            {currentStep === steps.length - 1 && selectedPlan !== null && (
              <Button onClick={() => alert(t('subscriptions.placeOrderButton'))} className="bg-green-500 text-white hover:bg-green-600">
                {t('subscriptions.placeOrderButton')}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
} 
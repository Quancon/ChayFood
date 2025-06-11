import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function Partners() {
  const { t } = useTranslation( 'common');

  const partnersData = [
    {
      id: 1,
      name: t('partners.partner1.name'),
      logo: "/partners/partner1.png"
    },
    {
      id: 2,
      name: t('partners.partner2.name'),
      logo: "/partners/partner2.png"
    },
    {
      id: 3,
      name: t('partners.partner3.name'),
      logo: "/partners/partner3.png"
    }
  ];
  
  const clientsData = [
    {
      id: 1,
      name: t('partners.client1.name'),
      logo: "/clients/client1.png"
    },
    {
      id: 2,
      name: t('partners.client2.name'),
      logo: "/clients/client2.png"
    },
    {
      id: 3,
      name: t('partners.client3.name'),
      logo: "/clients/client3.png"
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Partners Section */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            {t('partners.title')}
          </h2>
          <p className="text-gray-600 text-center mb-12">
            {t('partners.subtitle')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {partnersData.map((partner, index) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative w-full h-20">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Clients Section */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            {t('partners.clientsTitle')}
          </h2>
          <p className="text-gray-600 text-center mb-12">
            {t('partners.clientsSubtitle')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {clientsData.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="relative w-full h-20">
                  <Image
                    src={client.logo}
                    alt={client.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              {t('partners.clickLogo')}
            </p>
            <p className="text-gray-600">
              {t('partners.contactText')} <a href="mailto:business@fitfood.vn" className="text-green-600 hover:text-green-700">business@fitfood.vn</a> {t('partners.contactText2')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 
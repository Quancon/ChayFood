import '@/globals.css'
import { Inter } from 'next/font/google'
import Navbar from '@/components/navbar'
import { ChatAgent } from '@/components/chat/chat-agent'
import ClientProviders from '@/components/ClientProviders'
import { dir } from 'i18next'
import { languages } from '@/i18n/settings'
import initTranslations from '@/i18n'
import TranslationsProvider from '@/components/TranslationsProvider'

const i18nNamespaces = ['common'];

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }))
}

const inter = Inter({ subsets: ['latin'] })

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode,
  params: Promise<{ lng: string }>
}) {
  const { lng } = await params;
  const { t, resources } = await initTranslations(lng, i18nNamespaces)
  return (
    <html lang={lng} dir={dir(lng)}>
      <body className={inter.className}>
        <TranslationsProvider
          namespaces={i18nNamespaces}
          locale={lng}
          resources={resources}
        >
          <ClientProviders>
            <Navbar lng={lng} />
            <main className="pt-20">
              {children}
            </main>
            <footer className="bg-gray-900 text-white py-12">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4">{t('footer.company.name')}</h3>
                    <p className="text-gray-400">{t('footer.company.address')}</p>
                    <p className="text-gray-400">{t('footer.company.phone')}</p>
                    <p className="text-gray-400">{t('footer.company.email')}</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4">{t('footer.terms.title')}</h3>
                    <ul className="space-y-2">
                      <li><a href="#" className="text-gray-400 hover:text-white">{t('footer.terms.generalPolicy')}</a></li>
                      <li><a href="#" className="text-gray-400 hover:text-white">{t('footer.terms.paymentPolicy')}</a></li>
                      <li><a href="#" className="text-gray-400 hover:text-white">{t('footer.terms.shippingPolicy')}</a></li>
                      <li><a href="#" className="text-gray-400 hover:text-white">{t('footer.terms.privacyPolicy')}</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4">{t('footer.social.title')}</h3>
                    <div className="flex space-x-4">
                      <a href="#" className="text-gray-400 hover:text-white">{t('footer.social.facebook')}</a>
                      <a href="#" className="text-gray-400 hover:text-white">{t('footer.social.instagram')}</a>
                      <a href="#" className="text-gray-400 hover:text-white">{t('footer.social.twitter')}</a>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4">{t('footer.newsletter.title')}</h3>
                    <p className="text-gray-400 mb-4">{t('footer.newsletter.description')}</p>
                    <div className="flex">
                      <input type="email" placeholder={t('footer.newsletter.placeholder')} className="px-4 py-2 rounded-l-md w-full" />
                      <button className="bg-green-600 text-white px-4 py-2 rounded-r-md hover:bg-green-700">
                        {t('footer.newsletter.subscribe')}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
                  {t('footer.copyright')}
                </div>
              </div>
            </footer>
            <ChatAgent />
          </ClientProviders>
        </TranslationsProvider>
      </body>
    </html>
  )
} 
import '@/globals.css'
import { Inter } from 'next/font/google'
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
  const { resources } = await initTranslations(lng, i18nNamespaces)
  return (
    <html lang={lng} dir={dir(lng)}>
      <body className={inter.className}>
        <TranslationsProvider
          namespaces={i18nNamespaces}
          locale={lng}
          resources={resources}
        >
          <ClientProviders>
            {children}
            <ChatAgent />
          </ClientProviders>
        </TranslationsProvider>
      </body>
    </html>
  )
} 
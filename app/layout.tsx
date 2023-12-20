import { BgGradient } from '@components/BgGradient';
import ThemeProvider from '@components/Providers';
import QueryProvider from '@components/QueryProvider';
import SiteFooter from '@components/SiteFooter';
import { SiteHeader } from '@components/SiteHeader';
import { WalletProvider } from '@components/wallet/context/WalletContext'
import { Web3ModalProvider } from '@components/wallet/context/Web3Modal'
// import 'antd/dist/reset.css'
import '@public/antd.min.css'
import { ReduxProvider } from '@redux/ReduxProvider'
import '@styles/global.css'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

// export function generateStaticParams() {
// 	return [{ locale: 'en-US' }, { locale: 'zh-CN' }]
// }

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: Record<string, any>
}) {
  return (
    <html lang={locale}>
      <head />
      <body>
        <QueryProvider>
          <ReduxProvider>
                <ThemeProvider locale={locale}>
            <Web3ModalProvider>
              <WalletProvider>
                  {/* <BgGradient /> */}
                  <SiteHeader />
                  <main>{children}</main>
                  <SiteFooter />
              </WalletProvider>
            </Web3ModalProvider>
                </ThemeProvider>
          </ReduxProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  // const t = await getTranslations('site')
  // const locale = await getLocale()
  const title = 'Evm-inscr' // t('title')
  const description = 'evm inscription' //  t('desc')

  return {
    title,
    description,
    icons: {
      icon: '/favicon.ico'
    },
    metadataBase: new URL('https://element.market'),
    openGraph: {
      title,
      description,
      url: 'https://element.market',
      siteName: title,
      images: [
        {
          url: 'https://element.market/resource/images/Element.png',
          width: 800,
          height: 600
        },
        {
          url: 'https://element.market/resource/images/Element.png',
          width: 1800,
          height: 1600,
          alt: 'Element Market'
        }
      ],
      // locale,
      type: 'website'
    }
  }
}
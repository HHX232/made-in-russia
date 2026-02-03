import '@/fonts/fonts.scss'
import DefaultProvider from '@/providers/DefaultProvider'
import '@/scss/_variables.scss'
import '@/scss/config/base.scss'
import '@/scss/config/fonts.scss'
import '@/scss/config/functions.scss'
import '@/scss/config/keyframes.scss'
import '@/scss/config/mixins.scss'
import '@/scss/config/placeholders.scss'
import '@/scss/config/root.scss'
import '@/scss/config/typography.scss'
import '@/scss/main.scss'
import 'react-loading-skeleton/dist/skeleton.css'
import '@/components/UI-kit/loaders/nprogress-provider.scss'
import '@/scss/config/reset.scss'
import {Toaster} from 'sonner'
import NProgressProvider from '@/components/UI-kit/loaders/nprogress-provider'
import {NextIntlClientProvider} from 'next-intl'
import ClientStyleLoader from '@/components/ClientStyleLoader'
import {getMessages} from 'next-intl/server'
import {getCurrentLocale} from '@/lib/locale-detection'
import FavoritesProvider from '@/providers/FavoritesProvider'
import {WebSocketProvider} from '@/providers/WebSocketProvider'
import LatestViewsProvider from '@/providers/LatestViewsProvider'
import {Viewport} from 'next'
import YandexMetrika from '@/components/YandexMetrika/YandexMetrika'

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const locale = await getCurrentLocale()
  const messages = await getMessages()
  return (
    <>
      <html lang={locale}>
        <body style={{overflowY: 'auto', height: '100%', position: 'relative'}}>
          <YandexMetrika />
          <NProgressProvider />

          <DefaultProvider>
            <NextIntlClientProvider messages={messages}>
              <WebSocketProvider>
                <FavoritesProvider>
                  <LatestViewsProvider>{children}</LatestViewsProvider>
                </FavoritesProvider>
              </WebSocketProvider>
              <ClientStyleLoader />
              <Toaster
                visibleToasts={20}
                style={{zIndex: '10100009999'}}
                theme={'dark'}
                position={'top-right'}
                duration={3500}
              />{' '}
            </NextIntlClientProvider>
          </DefaultProvider>

          <div id='modal_portal'></div>
        </body>
      </html>
    </>
  )
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
} as const

export async function generateMetadata() {
  return {
    title: {
      absolute: 'Exporteru',
      template: `%s | Exporteru`
    },
    openGraph: {
      title: 'Exporteru'
    },
    icons: {
      icon: '/mstile-c-144x144.png',
      shortcut: '/favicon-c-32x32.png',
      apple: [
        {
          url: '/apple-touch-icon-cpec-144x144.png',
          sizes: '144x144',
          type: 'image/png'
        },
        {
          url: '/apple-touch-icon-c-152x152.png',
          sizes: '152x152',
          type: 'image/png'
        }
      ],

      // Другие важные форматы
      other: [
        // Для старых устройств
        {
          rel: 'apple-touch-icon-precomposed',
          url: '/apple-touch-icon-c-144x144.png',
          sizes: '144x144',
          type: 'image/png'
        },

        // Для Windows
        {
          rel: 'msapplication-TileImage',
          url: '/mstile-c-144x144.png'
        },
        {
          rel: 'msapplication-TileImage',
          url: '/mstile-c-150x150.png',
          sizes: '150x150'
        },

        // Базовые favicon
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          url: '/favicon-16x16.png'
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          url: '/favicon-c-32x32.png'
        }
        // {
        //   rel: 'icon',
        //   type: 'image/x-icon',
        //   url: '/favicon.ico'
        // }
      ]
    }
  }
}

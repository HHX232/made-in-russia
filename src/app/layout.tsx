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
import Script from 'next/script'
import {headers} from 'next/headers'

const PRIVATE_ROUTES = ['/vendor', '/profile', '/admin']

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const locale = await getCurrentLocale()
  const messages = await getMessages()

  // Получаем текущий путь
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  // Проверяем, является ли роут приватным
  const isPrivateRoute = PRIVATE_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))

  return (
    <>
      <html lang={locale}>
        <body style={{overflowY: 'auto', height: '100%', position: 'relative'}}>
          {/* Yandex Metrika - только для публичных страниц */}
          {!isPrivateRoute && (
            <>
              <Script
                id='yandex-metrika'
                strategy='afterInteractive'
                dangerouslySetInnerHTML={{
                  __html: `
                    (function(m,e,t,r,i,k,a){
                      m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                      m[i].l=1*new Date();
                      for (var j = 0; j < document.scripts.length; j++) {
                        if (document.scripts[j].src === r) { return; }
                      }
                      k=e.createElement(t),a=e.getElementsByTagName(t)[0],
                      k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
                    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=106611450', 'ym');

                    ym(106611450, 'init', {
                      ssr: true,
                      webvisor: true,
                      clickmap: true,
                      ecommerce: "dataLayer",
                      accurateTrackBounce: true,
                      trackLinks: true
                    });
                  `
                }}
              />

              <noscript>
                <div>
                  <img
                    src='https://mc.yandex.ru/watch/106611450'
                    style={{position: 'absolute', left: '-9999px'}}
                    alt=''
                  />
                </div>
              </noscript>
            </>
          )}

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
              />
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
      other: [
        {
          rel: 'apple-touch-icon-precomposed',
          url: '/apple-touch-icon-c-144x144.png',
          sizes: '144x144',
          type: 'image/png'
        },
        {
          rel: 'msapplication-TileImage',
          url: '/mstile-c-144x144.png'
        },
        {
          rel: 'msapplication-TileImage',
          url: '/mstile-c-150x150.png',
          sizes: '150x150'
        },
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
      ]
    }
  }
}

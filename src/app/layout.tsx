import '@/fonts/fonts.scss'
import DefaultProvider from '@/providers/DefaultProvider'
import '@/scss/_variables.scss'
import '@/scss/main.scss'
import 'react-loading-skeleton/dist/skeleton.css'
import '@/components/UI-kit/loaders/nprogress-provider.scss'
import {Toaster} from 'sonner'
import NProgressProvider from '@/components/UI-kit/loaders/nprogress-provider'
import {NextIntlClientProvider} from 'next-intl'
import ClientStyleLoader from '@/components/ClientStyleLoader'
import {getMessages, getTranslations} from 'next-intl/server'
import {getCurrentLocale} from '@/lib/locale-detection'

// import GoogleRecaptchaProviderComponent from '@/providers/GoogleRecaptchaProviderComponent'
// import {NextIntlClientProvider} from 'next-intl'

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const locale = await getCurrentLocale()
  const messages = await getMessages()
  return (
    <>
      <html lang={locale}>
        <body>
          <NProgressProvider />

          <DefaultProvider>
            <NextIntlClientProvider messages={messages}>
              {/* <GoogleRecaptchaProviderComponent> */}
              {children}
              {/* </GoogleRecaptchaProviderComponent> */}
              <ClientStyleLoader />
              <Toaster theme={'dark'} position={'top-right'} duration={3500} />
            </NextIntlClientProvider>
          </DefaultProvider>

          <div id='modal_portal'></div>
        </body>
      </html>
    </>
  )
}

export async function generateMetadata() {
  const t = await getTranslations('MetaTags.MainPage')
  return {
    title: {
      absolute: 'Exporteru',
      template: `%s | Exporteru`
    },
    description: `${t('firstText')}`,

    openGraph: {
      title: 'Exporteru',
      description: `${t('secondText')}`
    },
    icons: {
      icon: '/mstile-c-144x144.png',

      // Альтернативные иконки
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

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
import {getMessages} from 'next-intl/server'
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

// export async function generateMetadata() {
//   const cookieStore = await cookies()
//   const t = getTranslations()
//   let locale = cookieStore.get('NEXT_LOCALE')?.value

//   const headersList = await headers()

//   locale = headersList.get('x-next-intl-locale') || headersList.get('x-locale') || undefined

//   if (!locale) {
//     const referer = headersList.get('referer')
//     if (referer) {
//       const match = referer.match(/\/([a-z]{2})\//)
//       if (match && ['en', 'ru', 'zh'].includes(match[1])) {
//         locale = match[1]
//       }
//     }
//   }
//   try {
//     const initialPage1 = await ProductService.getAll({page: 0, size: 10, currentLang: locale}, undefined, locale)

//     return {
//       title: {
//         absolute: 'Exporteru',
//         template: `%s | Exporteru`
//       },
//       description: `Exporteru — онлайн-платформа для экспорта товаров из России. Мы помогаем российским компаниям находить иностранных контрагентов и выходить на международные рынки. Специализируемся на оптовых поставках продукции, таких как: ${initialPage1.content.map((item) => item.title).join(', ')} и других категорий. Комплексное сопровождение: от размещения до заключения экспортного контракта. Персональный менеджер на весь период сотрудничества.`,

//       openGraph: {
//         title: 'Exporteru',
//         description: `Exporteru — сервис для экспорта товаров из России. Предлагаем поддержку на всех этапах: подбор контрагентов, переговоры, заключение сделок. ${initialPage1.content.map((item) => item.title).join(', ')} и другие экспортные позиции. Работаем напрямую с поставщиками и международными покупателями.`
//       },
//       icons: {
//         icon: '/mstile-c-144x144.png',

//         // Альтернативные иконки
//         shortcut: '/favicon-c-32x32.png',
//         apple: [
//           {
//             url: '/apple-touch-icon-cpec-144x144.png',
//             sizes: '144x144',
//             type: 'image/png'
//           },
//           {
//             url: '/apple-touch-icon-c-152x152.png',
//             sizes: '152x152',
//             type: 'image/png'
//           }
//         ],

//         // Другие важные форматы
//         other: [
//           // Для старых устройств
//           {
//             rel: 'apple-touch-icon-precomposed',
//             url: '/apple-touch-icon-c-144x144.png',
//             sizes: '144x144',
//             type: 'image/png'
//           },

//           // Для Windows
//           {
//             rel: 'msapplication-TileImage',
//             url: '/mstile-c-144x144.png'
//           },
//           {
//             rel: 'msapplication-TileImage',
//             url: '/mstile-c-150x150.png',
//             sizes: '150x150'
//           },

//           // Базовые favicon
//           {
//             rel: 'icon',
//             type: 'image/png',
//             sizes: '16x16',
//             url: '/favicon-16x16.png'
//           },
//           {
//             rel: 'icon',
//             type: 'image/png',
//             sizes: '32x32',
//             url: '/favicon-c-32x32.png'
//           }
//           // {
//           //   rel: 'icon',
//           //   type: 'image/x-icon',
//           //   url: '/favicon.ico'
//           // }
//         ]
//       }
//     }
//   } catch (error) {
//     console.error('Error fetching card data:', error)
//     return {
//       title: 'Exporteru'
//     }
//   }
// }

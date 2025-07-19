import DefaultProvider from '@/providers/DefaultProvider'
import {hasLocale, NextIntlClientProvider} from 'next-intl'
import {routing} from '@/i18n/routing'
import {notFound} from 'next/navigation'
import {getMessages} from 'next-intl/server'
import {MessageProvider} from '@/providers/MessageProvider'
import ClientStyleLoader from '@/components/ClientStyleLoader'

// Критичные стили загружаем сразу
import '@/fonts/fonts.scss'
import '@/scss/_variables.scss'
import '@/scss/main.scss'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

export default async function RootLayoutLanguage({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{locale: string}>
}) {
  const {locale} = await params

  // Валидация локали в начале
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  // Получение сообщений происходит только после валидации
  const messages = await getMessages()

  return (
    <DefaultProvider>
      <NextIntlClientProvider messages={messages}>
        <MessageProvider initialMessages={messages}>
          {children}
          <ClientStyleLoader />
        </MessageProvider>
      </NextIntlClientProvider>
    </DefaultProvider>
  )
}

// import '@/fonts/fonts.scss'

// import DefaultProvider from '@/providers/DefaultProvider'
// import '@/scss/_variables.scss'
// import '@/scss/main.scss'

// import 'react-loading-skeleton/dist/skeleton.css'
// import 'slick-carousel/slick/slick.css'
// import 'slick-carousel/slick/slick-theme.css'
// import '@/components/UI-kit/loaders/nprogress-provider.scss'
// import 'md-editor-rt/lib/style.css'
// // import {Toaster} from 'sonner'
// // import ProductService from '@/services/products/product.service'
// // import {NO_INDEX_PAGE} from '@/constants/seo.constants'
// import {hasLocale, NextIntlClientProvider} from 'next-intl'
// import {routing} from '@/i18n/routing'
// import {notFound} from 'next/navigation'
// import {getMessages} from 'next-intl/server'
// // import {cookies} from 'next/headers'
// import {MessageProvider} from '@/providers/MessageProvider'

// export default async function RootLayoutLanguage({
//   children,
//   params
// }: {
//   children: React.ReactNode
//   params: Promise<{locale: string}>
// }) {
//   const {locale} = await params
//   const messages = await getMessages()
//   if (!hasLocale(routing.locales, locale)) {
//     notFound()
//   }

//   return (
//     <DefaultProvider>
//       <NextIntlClientProvider>
//         <MessageProvider initialMessages={messages}>
//           {/* <SmartTranslationProvider initialMessages={messages}> */}
//           {children}
//           {/* <Toaster theme={'dark'} position={'top-right'} duration={3500} /> */}
//           {/* </SmartTranslationProvider> */}
//         </MessageProvider>
//       </NextIntlClientProvider>
//     </DefaultProvider>
//   )
// }

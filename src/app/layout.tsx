import '@/fonts/fonts.scss'

import DefaultProvider from '@/providers/DefaultProvider'
import '@/scss/_variables.scss'
import '@/scss/main.scss'

import 'react-loading-skeleton/dist/skeleton.css'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import '@/components/UI-kit/loaders/nprogress-provider.scss'
import {Toaster} from 'sonner'
import NProgressProvider from '@/components/UI-kit/loaders/nprogress-provider'
import ProductService from '@/services/products/product.service'
import {NO_INDEX_PAGE} from '@/constants/seo.constants'

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html>
      <body>
        <NProgressProvider />

        <DefaultProvider>
          {children}
          <Toaster theme={'dark'} position={'top-right'} duration={3500} />
        </DefaultProvider>
        <div id='modal_portal'></div>
      </body>
    </html>
  )
}

export async function generateMetadata() {
  try {
    const initialPage1 = await ProductService.getAll({page: 0, size: 10})

    return {
      ...NO_INDEX_PAGE,
      title: 'Made In Russia',
      description:
        'Made in Russia — оптовые поставки стройматериалов из России в Китай, РБ, Казахстан: пиломатериалы (брус, доска), натуральный камень (гранит, мрамор), металлопрокат (арматура, профнастил), изоляция (минвата, пенопласт). Работаем напрямую с поставщиками. ' +
        `Предоставляем товары наподобие ${initialPage1.content.map((item) => item.title).join(', ')} и многое другое!`,
      openGraph: {
        title: 'Made In Russia',
        description:
          'Made in Russia — оптовые поставки стройматериалов из России в Китай, РБ, Казахстан: пиломатериалы (брус, доска), натуральный камень (гранит, мрамор), металлопрокат (арматура, профнастил), изоляция (минвата, пенопласт). Работаем напрямую с поставщиками'
        // images: initialPage1.content[0].media ? [initialPage1.content[0].media[0]] : []
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
  } catch (error) {
    console.error('Error fetching card data:', error)
    return {
      title: 'Made In Russia'
    }
  }
}

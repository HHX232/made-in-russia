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
      title: 'Made In Russia',
      description:
        'Made in Russia — оптовые поставки стройматериалов из России в Китай, РБ, Казахстан: пиломатериалы (брус, доска), натуральный камень (гранит, мрамор), металлопрокат (арматура, профнастил), изоляция (минвата, пенопласт). Работаем напрямую с поставщиками. ' +
        `Предоставляем товары наподобие ${initialPage1.content.map((item) => item.title).join(', ')} и многое другое!`,
      openGraph: {
        title: 'Made In Russia',
        description:
          'Made in Russia — оптовые поставки стройматериалов из России в Китай, РБ, Казахстан: пиломатериалы (брус, доска), натуральный камень (гранит, мрамор), металлопрокат (арматура, профнастил), изоляция (минвата, пенопласт). Работаем напрямую с поставщиками'
        // images: initialPage1.content[0].media ? [initialPage1.content[0].media[0]] : []
      }
    }
  } catch (error) {
    console.error('Error fetching card data:', error)
    return {
      title: 'Made In Russia'
    }
  }
}

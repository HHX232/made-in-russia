/* eslint-disable @typescript-eslint/no-explicit-any */
import {axiosClassic} from '@/api/api.interceptor'
import HomePage from '@/components/pages/HomePage/HomePage'
import {getCurrentLocale} from '@/lib/locale-detection'
import {Product} from '@/services/products/product.types'
// import {cookies, headers} from 'next/headers'

// async function getLocale(): Promise<string> {
//   const cookieStore = await cookies()
//   let locale = cookieStore.get('NEXT_LOCALE')?.value

//   if (!locale) {
//     const headersList = await headers()
//     locale = headersList.get('x-next-intl-locale') || headersList.get('x-locale') || undefined

//     if (!locale) {
//       const referer = headersList.get('referer')
//       if (referer) {
//         const match = referer.match(/\/([a-z]{2})\//)
//         if (match && ['en', 'ru', 'zh'].includes(match[1])) {
//           locale = match[1]
//         }
//       }
//     }
//   }

//   return locale || 'en'
// }

export interface IPromoFromServer {
  id: number
  title: string
  subtitle: string
  thirdText: string
  imageUrl: string
  isBig: boolean
  expirationDate: string
  creationDate: string
  lastModificationDate: string
  link: string
}

interface IGeneralResponse {
  products: {
    content: Product[]
    last: boolean
  }
  categories: any[]
  allCategories: any[]
  advertisements?: IPromoFromServer[]
}

// теперь только один запрос
async function getInitialData(locale: string) {
  const {data} = await axiosClassic.get<IGeneralResponse>('/general', {
    headers: {
      'Accept-Language': locale,
      'x-locale': locale
    }
  })

  // console.log('general data', data)
  return data
}

export default async function Home() {
  const locale = await getCurrentLocale()
  // console.log('locale в доме', locale)
  const {products, categories, advertisements} = await getInitialData(locale)

  return (
    <HomePage
      ads={advertisements ?? []}
      initialProducts={products.content}
      initialHasMore={!products.last}
      categories={categories}
    />
  )
}

export async function generateMetadata() {
  try {
    return {
      title: {
        absolute: 'Exporteru',
        template: `%s | Exporteru`
      },
      description: `Exporteru — онлайн-платформа для экспорта товаров из России. Мы помогаем российским компаниям находить иностранных контрагентов и выходить на международные рынки. Специализируемся на оптовых поставках продукции. Комплексное сопровождение: от размещения до заключения экспортного контракта. Персональный менеджер на весь период сотрудничества.`,
      openGraph: {
        title: 'Exporteru',
        description: `Exporteru — сервис для экспорта товаров из России. Предлагаем поддержку на всех этапах: подбор контрагентов, переговоры, заключение сделок. Работаем напрямую с поставщиками и международными покупателями.`
      },
      icons: {
        icon: '/mstile-c-144x144.png',
        shortcut: '/favicon-c-32x32.png',
        apple: [
          {url: '/apple-touch-icon-cpec-144x144.png', sizes: '144x144', type: 'image/png'},
          {url: '/apple-touch-icon-c-152x152.png', sizes: '152x152', type: 'image/png'}
        ],
        other: [
          {
            rel: 'apple-touch-icon-precomposed',
            url: '/apple-touch-icon-c-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {rel: 'msapplication-TileImage', url: '/mstile-c-144x144.png'},
          {rel: 'msapplication-TileImage', url: '/mstile-c-150x150.png', sizes: '150x150'},
          {rel: 'icon', type: 'image/png', sizes: '16x16', url: '/favicon-16x16.png'},
          {rel: 'icon', type: 'image/png', sizes: '32x32', url: '/favicon-c-32x32.png'}
        ]
      }
    }
  } catch (error) {
    console.error('Error fetching metadata:', error)
    return {title: 'Exporteru'}
  }
}

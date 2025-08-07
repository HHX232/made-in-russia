import {axiosClassic} from '@/api/api.interceptor'
import HomePage from '@/components/pages/HomePage/HomePage'
import CategoriesService from '@/services/categoryes/categoryes.service'
import ProductService from '@/services/products/product.service'
import {cookies, headers} from 'next/headers'

// Вынести определение локали в отдельную функцию
async function getLocale(): Promise<string> {
  const cookieStore = await cookies()
  let locale = cookieStore.get('NEXT_LOCALE')?.value

  if (!locale) {
    const headersList = await headers()
    locale = headersList.get('x-next-intl-locale') || headersList.get('x-locale') || undefined

    if (!locale) {
      const referer = headersList.get('referer')
      if (referer) {
        const match = referer.match(/\/([a-z]{2})\//)
        if (match && ['en', 'ru', 'zh'].includes(match[1])) {
          locale = match[1]
        }
      }
    }
  }

  return locale || 'en'
}

// Параллельное выполнение запросов
async function getInitialData(locale: string) {
  const [initialPage1, categories, adsFromSerfer] = await Promise.all([
    ProductService.getAll({page: 0, size: 20, currentLang: locale}, undefined, locale),
    CategoriesService.getAll(locale),
    axiosClassic.get<IPromoFromServer[]>('/advertisements', {
      headers: {
        'x-locale': locale,
        'Accept-Language': locale
      }
    })
  ])

  return {initialPage1, categories, adsFromSerfer}
}
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
export default async function Home() {
  const locale = await getLocale()
  const {initialPage1, categories, adsFromSerfer} = await getInitialData(locale)
  return (
    <HomePage
      ads={adsFromSerfer.data}
      initialProducts={initialPage1.content}
      initialHasMore={!initialPage1.last}
      categories={categories}
    />
  )
}

export async function generateMetadata() {
  const cookieStore = await cookies()
  let locale = cookieStore.get('NEXT_LOCALE')?.value

  const headersList = await headers()

  locale = headersList.get('x-next-intl-locale') || headersList.get('x-locale') || undefined

  if (!locale) {
    const referer = headersList.get('referer')
    if (referer) {
      const match = referer.match(/\/([a-z]{2})\//)
      if (match && ['en', 'ru', 'zh'].includes(match[1])) {
        locale = match[1]
      }
    }
  }
  try {
    const initialPage1 = await ProductService.getAll({page: 0, size: 10, currentLang: locale}, undefined, locale)

    return {
      title: {
        absolute: 'Exporteru',
        template: `%s | Exporteru`
      },
      description: `Exporteru — онлайн-платформа для экспорта товаров из России. Мы помогаем российским компаниям находить иностранных контрагентов и выходить на международные рынки. Специализируемся на оптовых поставках продукции, таких как: ${initialPage1.content.map((item) => item.title).join(', ')} и других категорий. Комплексное сопровождение: от размещения до заключения экспортного контракта. Персональный менеджер на весь период сотрудничества.`,

      openGraph: {
        title: 'Exporteru',
        description: `Exporteru — сервис для экспорта товаров из России. Предлагаем поддержку на всех этапах: подбор контрагентов, переговоры, заключение сделок. ${initialPage1.content.map((item) => item.title).join(', ')} и другие экспортные позиции. Работаем напрямую с поставщиками и международными покупателями.`
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
      title: 'Exporteru'
    }
  }
}

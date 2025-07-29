import {axiosClassic} from '@/api/api.interceptor'
import HomePage from '@/components/pages/HomePage/HomePage'
import {NO_INDEX_PAGE} from '@/constants/seo.constants'
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
  const [initialPage1, categories] = await Promise.all([
    ProductService.getAll({page: 0, size: 20, currentLang: locale}, undefined, locale),
    CategoriesService.getAll(locale)
  ])

  return {initialPage1, categories}
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
  const {initialPage1, categories} = await getInitialData(locale)
  const adsFromSerfer = await axiosClassic.get<IPromoFromServer[]>('/advertisements')
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
  const locale = await getLocale()

  try {
    // Уменьшить количество товаров для метаданных
    const initialPage1 = await ProductService.getAll({page: 0, size: 5, currentLang: locale}, undefined, locale)

    const productTitles = initialPage1.content
      .slice(0, 3) // Ограничить количество товаров в описании
      .map((item) => item.title)
      .join(', ')

    return {
      ...NO_INDEX_PAGE,
      title: {
        absolute: 'Exporteru',
        template: `%s | Exporteru`
      },
      description: `Exporteru — оптовые поставки стройматериалов из России в Китай, РБ, Казахстан: пиломатериалы (брус, доска), натуральный камень (гранит, мрамор), металлопрокат (арматура, профнастил), изоляция (минвата, пенопласт). Работаем напрямую с поставщиками. Предоставляем товары наподобие ${productTitles} и многое другое!`,
      openGraph: {
        title: 'Exporteru',
        description:
          'Exporteru — оптовые поставки стройматериалов из России в Китай, РБ, Казахстан: пиломатериалы (брус, доска), натуральный камень (гранит, мрамор), металлопрокат (арматура, профнастил), изоляция (минвата, пенопласт). Работаем напрямую с поставщиками'
      },
      icons: {
        icon: '/mstile-c-144x144.png',
        shortcut: '/favicon-c-32x32.png',
        apple: [
          {
            url: '/apple-touch-icon-cpec-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          }
        ],
        other: [
          {
            rel: 'icon',
            type: 'image/png',
            sizes: '32x32',
            url: '/favicon-c-32x32.png'
          }
        ]
      }
    }
  } catch (error) {
    console.error('Error fetching card data:', error)
    return {
      title: {
        absolute: 'Exporteru',
        template: `%s | Exporteru`
      }
    }
  }
}

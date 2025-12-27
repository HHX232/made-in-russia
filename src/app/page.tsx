/* eslint-disable @typescript-eslint/no-explicit-any */
import {axiosClassic} from '@/api/api.interceptor'
import HomePage from '@/components/pages/HomePage/HomePage'
import {getCurrentLocale} from '@/lib/locale-detection'
import {Product} from '@/services/products/product.types'
import {getTranslations} from 'next-intl/server'

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

async function getInitialData(locale: string) {
  const {data} = await axiosClassic.get<IGeneralResponse>('/general', {
    headers: {
      'Accept-Language': locale,
      'x-locale': locale
    }
  })
  return data
}

export default async function Home() {
  const locale = await getCurrentLocale()
  const {products, categories, advertisements} = await getInitialData(locale)
  return (
    <HomePage
      ads={advertisements ?? []}
      initialProducts={products.content}
      initialHasMore={!products.last}
      categories={categories}
      isShowFilters={false}
    />
  )
}

export async function generateMetadata() {
  const t = await getTranslations('MetaTags.MainPage')
  try {
    return {
      title: {
        absolute: `${t('title')} | Exporteru`,
        template: `%s | Exporteru`
      },
      description: `${t('firstText')}.`,
      openGraph: {
        title: 'Exporteru',
        description: `Exporteru — ${t('secondText')}.`
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

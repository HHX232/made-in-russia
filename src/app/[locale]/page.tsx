import HomePage from '@/components/pages/HomePage/HomePage'
import CategoriesService from '@/services/categoryes/categoryes.service'
import ProductService from '@/services/products/product.service'
// import ProductService from '@/services/products/product.service'
import {cookies, headers} from 'next/headers'

// import ProductService from '@/services/products/product.service'

export default async function Home() {
  const cookieStore = await cookies()

  let locale = cookieStore.get('NEXT_LOCALE')?.value

  if (!locale) {
    const headersList = await headers()

    // Используем x-next-intl-locale (Next.js intl) или x-locale
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

  // console.log('locale в home page', locale)
  const initialPage1 = await ProductService.getAll(
    {page: 0, size: 20, currentLang: locale || 'en'},
    undefined,
    locale || 'en'
  )

  const categories = await CategoriesService.getAll(locale || 'en')

  console.log('initialPage1', initialPage1)
  return (
    <>
      <HomePage initialProducts={initialPage1.content} initialHasMore={!initialPage1.last} categories={categories} />
    </>
  )
}

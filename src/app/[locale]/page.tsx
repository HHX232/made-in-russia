import HomePage from '@/components/pages/HomePage/HomePage'
import CategoriesService from '@/services/categoryes/categoryes.service'
import ProductService from '@/services/products/product.service'
import {cookies} from 'next/headers'

// import ProductService from '@/services/products/product.service'

export default async function Home() {
  const cookieStore = await cookies()

  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en'

  const initialPage1 = await ProductService.getAll({page: 0, size: 10, currentLang: locale})
  const initialPage2 = await ProductService.getAll({page: 1, size: 10, currentLang: locale})
  const categories = await CategoriesService.getAll(locale)

  return (
    <>
      <HomePage
        initialProducts={[...initialPage1.content, ...initialPage2.content]}
        initialHasMore={!initialPage2.last}
        categories={categories}
      />
    </>
  )
}

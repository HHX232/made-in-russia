import HomePage from '@/components/pages/HomePage/HomePage'
import ProductService from '@/services/products/product.service'

export default async function Home() {
  const initialPage1 = await ProductService.getAll({page: 0, size: 10})
  const initialPage2 = await ProductService.getAll({page: 1, size: 10})

  return (
    <HomePage
      initialProducts={[...initialPage1.content, ...initialPage2.content]}
      initialHasMore={!initialPage2.last}
    />
  )
}

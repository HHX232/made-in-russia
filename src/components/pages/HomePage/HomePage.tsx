import Ads from '@/components/screens/Ads/Ads'
import Header from '@/components/MainComponents/Header/Header'
import {FC} from 'react'
import Catalog, {CatalogProps} from '@/components/screens/Catalog/Catalog'
import {Category} from '@/services/categoryes/categoryes.service'
import Footer from '@/components/MainComponents/Footer/Footer'
// import ProductService from '@/services/products/product.service'
// import {GetStaticProps} from 'next'

// export const getStaticProps: GetStaticProps = async () => {
//   const initialPage1 = await ProductService.getAll({page: 0, size: 10})
//   const initialPage2 = await ProductService.getAll({page: 1, size: 10})

//   return {
//     props: {
//       initialProducts: [...initialPage1.content, ...initialPage2.content],
//       initialHasMore: !initialPage2.last
//     },
//     revalidate: 60
//   }
// }

const HomePage: FC<CatalogProps & {categories: Category[]}> = ({
  initialProducts = [],
  initialHasMore = false,
  categories = []
}) => {
  return (
    <>
      <Header categories={categories} />
      <Ads />
      <Catalog initialProducts={initialProducts} initialHasMore={initialHasMore} />
      <Footer />
    </>
  )
}

export default HomePage

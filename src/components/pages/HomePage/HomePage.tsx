import Ads from '@/components/screens/Ads/Ads'
import Header from '@/components/MainComponents/Header/Header'
import {FC} from 'react'
import Catalog, {CatalogProps} from '@/components/screens/Catalog/Catalog'
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

const HomePage: FC<CatalogProps> = ({initialProducts = [], initialHasMore = false}) => {
  return (
    <>
      <Header />
      <Ads />
      <Catalog initialProducts={initialProducts} initialHasMore={initialHasMore} />
    </>
  )
}

export default HomePage

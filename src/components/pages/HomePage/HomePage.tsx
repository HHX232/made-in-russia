import Ads from '@/components/screens/Ads/Ads'
import Header from '@/components/MainComponents/Header/Header'
import {FC} from 'react'
import Catalog, {CatalogProps} from '@/components/screens/Catalog/Catalog'
import {Category} from '@/services/categoryes/categoryes.service'
import Footer from '@/components/MainComponents/Footer/Footer'

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

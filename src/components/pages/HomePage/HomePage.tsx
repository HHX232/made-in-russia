import Ads from '@/components/screens/Ads/Ads'
import Header from '@/components/MainComponents/Header/Header'
import {FC} from 'react'
import Catalog, {CatalogProps} from '@/components/screens/Catalog/Catalog'
import {Category} from '@/services/categoryes/categoryes.service'
import Footer from '@/components/MainComponents/Footer/Footer'
import {IPromoFromServer} from '@/app/page'

const HomePage: FC<CatalogProps & {categories: Category[]; ads: IPromoFromServer[]}> = ({
  initialProducts = [],
  initialHasMore = false,
  categories = [],
  ads = []
}) => {
  return (
    <>
      <Header categories={categories} />
      <p>Its new frontend</p>
      <Ads ads={ads} />
      <Catalog initialProducts={initialProducts} initialHasMore={initialHasMore} />
      <Footer />
    </>
  )
}

export default HomePage

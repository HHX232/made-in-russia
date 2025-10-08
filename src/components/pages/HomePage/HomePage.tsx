import Ads from '@/components/screens/Ads/Ads'
import Header from '@/components/MainComponents/Header/Header'
import {FC} from 'react'
import Catalog, {CatalogProps} from '@/components/screens/Catalog/Catalog'
import {Category} from '@/services/categoryes/categoryes.service'
import Footer from '@/components/MainComponents/Footer/Footer'
import {IPromoFromServer} from '@/app/page'
import Exports from '@/components/screens/Exports/Exports'

const HomePage: FC<CatalogProps & {categories: Category[]; ads: IPromoFromServer[]}> = ({
  initialProducts = [],
  initialHasMore = false,
  categories = [],
  ads = []
  // /Users/nikitatisevic/Desktop/made-in-russia/.next/static
}) => {
  return (
    <>
      <Header categories={categories} />
      <Ads ads={ads} />
      <Catalog initialProducts={initialProducts} initialHasMore={initialHasMore} isShowFilters={false} />
      <Exports />
      <Footer />
    </>
  )
}

export default HomePage

import Ads from '@/components/screens/Ads/Ads'
import Header from '@/components/MainComponents/Header/Header'
import {FC} from 'react'
import Catalog, {CatalogProps} from '@/components/screens/Catalog/Catalog'
import {Category} from '@/services/categoryes/categoryes.service'
import Footer from '@/components/MainComponents/Footer/Footer'
import {IPromoFromServer} from '@/app/page'
import Exports from '@/components/screens/Exports/Exports'
import PopularCategories from '@/components/screens/PopularCategories/PopularCategories'
import AdvantagesSection from '@/components/screens/AdvantagesSection/AdvantagesSection'

const HomePage: FC<CatalogProps & {categories: Category[]; ads: IPromoFromServer[]}> = ({
  initialProducts = [],
  initialHasMore = false,
  categories = [],
  ads = [],
  isShowFilters = false
  // /Users/nikitatisevic/Desktop/made-in-russia/.next/static
}) => {
  return (
    <>
      <Header categories={categories} />
      <Ads ads={ads} />
      <PopularCategories />
      <AdvantagesSection />
      <Catalog isShowFilters={isShowFilters} initialProducts={initialProducts} initialHasMore={initialHasMore} />
      <Exports />
      <Footer />
    </>
  )
}

export default HomePage

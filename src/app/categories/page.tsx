import Footer from '@/components/MainComponents/Footer/Footer'
import Header from '@/components/MainComponents/Header/Header'
import MainCategoryPage from '@/components/pages/MainCategoryPage /MainCategoryPage'
import Catalog from '@/components/screens/Catalog/Catalog'
import {getCurrentLocale} from '@/lib/locale-detection'
import CategoriesService from '@/services/categoryes/categoryes.service'
import {getTranslations} from 'next-intl/server'

export default async function CategoriesPage() {
  const locale = await getCurrentLocale()

  let categories
  try {
    categories = await CategoriesService.getAll(locale || 'en')
  } catch {
    categories = undefined
  }
  return (
    <div>
      <Header />
      <MainCategoryPage categories={categories} />
      <Catalog initialProducts={[]} initialHasMore />
      <Footer />
    </div>
  )
}

export async function generateMetadata() {
  const t = await getTranslations('catalogMeta')
  return {
    title: t('mainPageTitle'),
    description: t('mainPageText')
  }
}

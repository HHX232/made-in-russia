import Footer from '@/components/MainComponents/Footer/Footer'
import Header from '@/components/MainComponents/Header/Header'
import MainCategoryPage from '@/components/pages/MainCategoryPage /MainCategoryPage'
import {getCurrentLocale} from '@/lib/locale-detection'
import CategoriesService from '@/services/categoryes/categoryes.service'

export default async function CategoriesPage() {
  const locale = await getCurrentLocale()
  const categories = await CategoriesService.getAll(locale || 'en')
  return (
    <div>
      <Header />
      <MainCategoryPage categories={categories} />
      <Footer />
    </div>
  )
}

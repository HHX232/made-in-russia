import {getAbsoluteLanguage} from '@/api/api.helper'
import Footer from '@/components/MainComponents/Footer/Footer'
import Header from '@/components/MainComponents/Header/Header'
import MainCategoryPage from '@/components/pages/MainCategoryPage /MainCategoryPage'

export default async function CategoriesPage() {
  const locale = await getAbsoluteLanguage()
  return (
    <div>
      <Header />
      <MainCategoryPage currentLang={locale} />
      <Footer />
    </div>
  )
}

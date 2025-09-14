import Footer from '@/components/MainComponents/Footer/Footer'
import Header from '@/components/MainComponents/Header/Header'
import MainCategoryPage from '@/components/pages/MainCategoryPage /MainCategoryPage'
import {getCurrentLocale} from '@/lib/locale-detection'

export default async function CategoriesPage() {
  const locale = await getCurrentLocale()
  return (
    <div>
      <Header />
      <MainCategoryPage currentLang={locale} />
      <Footer />
    </div>
  )
}

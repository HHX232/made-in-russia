import Footer from '@/components/MainComponents/Footer/Footer'
import Header from '@/components/MainComponents/Header/Header'
import MainCategoryPage from '@/components/pages/MainCategoryPage /MainCategoryPage'
import {useLocale} from 'next-intl'

export default function CategoriesPage() {
  const locale = useLocale()
  return (
    <div>
      <Header />
      <MainCategoryPage currentLang={locale} />
      <Footer />
    </div>
  )
}

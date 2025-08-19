import {axiosClassic} from '@/api/api.interceptor'
import CategoryPage from '@/components/pages/CategoryPage/CategoryPage'
import CategoriesService from '@/services/categoryes/categoryes.service'
import {notFound} from 'next/navigation'
import {getAbsoluteLanguage} from '../page'

export default async function CategoryPageSpecial({params}: {params: Promise<{categoryName: string}>}) {
  const {categoryName} = await params
  let categories

  // Получаем локаль из куки или заголовков
  // let locale = cookieStore.get('NEXT_LOCALE')?.value

  const locale = await getAbsoluteLanguage()

  let companyes: {name: string; inn: string; ageInYears: string}[]
  try {
    // console.log('Category:', `/companies/l1_${categoryName}`)
    const {data} = await axiosClassic.get<{name: string; inn: string; ageInYears: string}[]>(
      `/companies/l1_${categoryName}`
    )

    console.log('data companyes:', data)
    companyes = data
  } catch {
    companyes = []
  }
  // console.log('companyes:', companyes)
  try {
    categories = await CategoriesService.getById('l1_' + categoryName, locale || 'en')
  } catch {
    notFound()
  }

  console.log('final comp', companyes)
  return (
    <CategoryPage
      companyes={companyes || []}
      idOfFilter={categories.id}
      categories={categories.children}
      categoryName={categoryName}
      categoryTitleName={categories.name}
      level={1}
    />
  )
}

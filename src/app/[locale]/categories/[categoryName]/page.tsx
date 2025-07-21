import {axiosClassic} from '@/api/api.interceptor'
import CategoryPage from '@/components/pages/CategoryPage/CategoryPage'
import CategoriesService from '@/services/categoryes/categoryes.service'
import {cookies, headers} from 'next/headers'
import {notFound} from 'next/navigation'

export default async function CategoryPageSpecial({params}: {params: Promise<{categoryName: string}>}) {
  const {categoryName} = await params
  let categories
  const cookieStore = await cookies()

  // Получаем локаль из куки или заголовков
  let locale = cookieStore.get('NEXT_LOCALE')?.value

  if (!locale) {
    const headersList = await headers()

    // Используем x-next-intl-locale (Next.js intl) или x-locale
    locale = headersList.get('x-next-intl-locale') || headersList.get('x-locale') || undefined

    if (!locale) {
      const referer = headersList.get('referer')
      if (referer) {
        const match = referer.match(/\/([a-z]{2})\//)
        if (match && ['en', 'ru', 'zh'].includes(match[1])) {
          locale = match[1]
        }
      }
    }
  }
  let companyes: {name: string; inn: string; ageInYears: string}[]
  try {
    // console.log('Category:', `/companies/l1_${categoryName}`)
    const {data} = await axiosClassic.get<{data: {name: string; inn: string; ageInYears: string}[]}>(
      `/companies/l1_${categoryName}`
    )

    // console.log('data companyes:', data)
    companyes = data.data
  } catch {
    companyes = []
  }
  // console.log('companyes:', companyes)
  try {
    categories = await CategoriesService.getById('l1_' + categoryName, locale || 'en')
  } catch {
    notFound()
  }

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

import {axiosClassic} from '@/api/api.interceptor'
import CategoryPage from '@/components/pages/CategoryPage/CategoryPage'
import CategoriesService from '@/services/categoryes/categoryes.service'
import {cookies, headers} from 'next/headers'
import {notFound} from 'next/navigation'

export default async function CategoryPageSpecialSecond({
  params
}: {
  params: Promise<{
    categoryName: string
    secondCategoryName: string
    thirdCategoryName: string
    thirdCAtegoryName: string
  }>
}) {
  const {thirdCategoryName, thirdCAtegoryName} = await params
  console.log('thirdCategoryName:', thirdCategoryName, 'thirdCAtegoryName', thirdCAtegoryName)
  let categories
  const cookieStore = await cookies()
  let locale = cookieStore.get('NEXT_LOCALE')?.value

  if (!locale) {
    const headersList = await headers()

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
    console.log('Category:', `/companies/l3_${thirdCategoryName}`)
    const {data} = await axiosClassic.get<{data: {name: string; inn: string; ageInYears: string}[]}>(
      `/companies/l3_${thirdCategoryName}`
    )

    console.log('data companyes:', data)
    companyes = data.data
  } catch {
    companyes = []
  }

  try {
    categories = await CategoriesService.getById('l3_' + (thirdCategoryName || thirdCAtegoryName), locale || 'en')
  } catch {
    notFound()
  }
  console.log('categories third by slug:', categories)

  return (
    <CategoryPage
      companyes={companyes || []}
      idOfFilter={categories.id}
      categories={categories.children}
      categoryName={thirdCategoryName || thirdCAtegoryName}
      categoryTitleName={categories.name}
      level={3}
    />
  )
}

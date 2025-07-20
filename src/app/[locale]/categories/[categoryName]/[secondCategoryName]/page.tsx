import {axiosClassic} from '@/api/api.interceptor'
import CategoryPage from '@/components/pages/CategoryPage/CategoryPage'
import CategoriesService from '@/services/categoryes/categoryes.service'
import {cookies, headers} from 'next/headers'
import {notFound} from 'next/navigation'

export default async function CategoryPageSpecialSecond({
  params
}: {
  params: Promise<{categoryName: string; secondCategoryName: string}>
}) {
  const {secondCategoryName} = await params
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
    console.log('Category:', `/companies/l2_${secondCategoryName}`)
    const {data} = await axiosClassic.get<{name: string; inn: string; ageInYears: string}[]>(
      `/companies/l2_${secondCategoryName}`
    )

    console.log('data companyes:', data)
    companyes = data
  } catch {
    companyes = []
  }
  console.log('companyes:', companyes)

  try {
    categories = await CategoriesService.getById('l2_' + secondCategoryName, locale || 'en')
  } catch {
    notFound()
  }
  console.log('categories second by slug:', categories)

  return (
    <CategoryPage
      companyes={companyes || []}
      idOfFilter={categories.id}
      categories={
        categories.children
        // .filter((category) => category.slug.toLocaleLowerCase() === categoryName.toLocaleLowerCase())[0]
        // .children.filter(
        //   (category) => category.slug.toLocaleLowerCase() === secondCategoryName.toLocaleLowerCase()
        // )[0].children
      }
      categoryName={secondCategoryName}
      categoryTitleName={categories.name}
      level={2}
    />
  )
}

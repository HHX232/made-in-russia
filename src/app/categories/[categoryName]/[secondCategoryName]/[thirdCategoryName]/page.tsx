import {getCurrentLocale} from '@/lib/locale-detection'

import {axiosClassic} from '@/api/api.interceptor'
import CategoryPage from '@/components/pages/CategoryPage/CategoryPage'
import CategoriesService from '@/services/categoryes/categoryes.service'
import {buildBreadcrumbs, findCategoryBySlug} from '@/utils/findCategoryPath'
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
  // console.log('thirdCategoryName:', thirdCategoryName, 'thirdCAtegoryName', thirdCAtegoryName)
  let categories
  let allCategories
  let breadcrumbs: {title: string; link: string}[] = []
  const locale = await getCurrentLocale()

  let companyes: {name: string; inn: string; ageInYears: string}[]
  try {
    // console.log('Category:', `/companies/l3_${thirdCategoryName}`)
    const {data} = await axiosClassic.get<{name: string; inn: string; ageInYears: string}[]>(
      `/companies/l3_${thirdCategoryName}`,
      {
        headers: {
          'Accept-Language': locale,
          'x-language': locale
        }
      }
    )
    // console.log('data companyes:', data)
    companyes = data
  } catch {
    companyes = []
  }

  try {
    allCategories = await CategoriesService.getAll(locale || 'en')

    const slugToFind = thirdCategoryName || thirdCAtegoryName
    const foundCategory = findCategoryBySlug(allCategories, slugToFind)

    categories = foundCategory || (await CategoriesService.getById('l3_' + slugToFind, locale || 'en'))

    breadcrumbs = buildBreadcrumbs(allCategories, slugToFind)
  } catch {
    notFound()
  }

  return (
    <CategoryPage
      companyes={companyes || []}
      idOfFilter={categories.id}
      breadcrumbs={breadcrumbs}
      categories={categories.children}
      categoryName={thirdCategoryName || thirdCAtegoryName}
      categoryTitleName={categories.name}
      level={3}
    />
  )
}

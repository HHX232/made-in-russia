import {getCurrentLocale} from '@/lib/locale-detection'

import {axiosClassic} from '@/api/api.interceptor'
import CategoryPage from '@/components/pages/CategoryPage/CategoryPage'
import CategoriesService from '@/services/categoryes/categoryes.service'
import {findCategoryBySlug, buildBreadcrumbs} from '@/utils/findCategoryPath'
import {notFound} from 'next/navigation'

export default async function CategoryPageSpecial({params}: {params: Promise<{categoryName: string}>}) {
  const {categoryName} = await params
  let categories
  let allCategories
  let breadcrumbs: {title: string; link: string}[] = []

  const locale = await getCurrentLocale()

  let companyes: {name: string; inn: string; ageInYears: string}[]
  try {
    // console.log('Category:', `/companies/l1_${categoryName}`)
    const {data} = await axiosClassic.get<{name: string; inn: string; ageInYears: string}[]>(
      `/companies/l1_${categoryName}`
    )

    console.log('curr lang:', locale)
    console.log('data companyes:', data)
    companyes = data
  } catch {
    companyes = []
  }
  // console.log('companyes:', companyes)
  try {
    allCategories = await CategoriesService.getAll(locale || 'en')

    const slugToFind = categoryName
    const foundCategory = findCategoryBySlug(allCategories, slugToFind)

    categories = foundCategory || (await CategoriesService.getById('l1_' + slugToFind, locale || 'en'))

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
      categoryName={categoryName}
      categoryTitleName={categories.name}
      level={1}
    />
  )
}

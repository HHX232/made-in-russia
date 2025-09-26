import {getCurrentLocale} from '@/lib/locale-detection'

import {axiosClassic} from '@/api/api.interceptor'
import CategoryPage from '@/components/pages/CategoryPage/CategoryPage'
import CategoriesService from '@/services/categoryes/categoryes.service'
import {findCategoryBySlug, buildBreadcrumbs} from '@/utils/findCategoryPath'
import {notFound} from 'next/navigation'

export default async function CategoryPageSpecialSecond({
  params
}: {
  params: Promise<{categoryName: string; secondCategoryName: string}>
}) {
  const {secondCategoryName} = await params
  let categories
  let allCategories
  let breadcrumbs: {title: string; link: string}[] = []
  const locale = await getCurrentLocale()

  let companyes: {name: string; inn: string; ageInYears: string}[]
  try {
    console.log('Category:', `/companies/l2_${secondCategoryName}`)
    const {data} = await axiosClassic.get<{name: string; inn: string; ageInYears: string}[]>(
      `/companies/l2_${secondCategoryName}`,
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
  // console.log('companyes:', companyes)

  try {
    allCategories = await CategoriesService.getAll(locale || 'en')

    const slugToFind = secondCategoryName
    const foundCategory = findCategoryBySlug(allCategories, slugToFind)

    categories = foundCategory || (await CategoriesService.getById('l2_' + slugToFind, locale || 'en'))

    breadcrumbs = buildBreadcrumbs(allCategories, slugToFind)
  } catch {
    notFound()
  }
  // console.log('categories second by slug:', categories)

  return (
    <CategoryPage
      companyes={companyes || []}
      breadcrumbs={breadcrumbs}
      idOfFilter={categories.id}
      categories={categories.children}
      categoryName={secondCategoryName}
      categoryTitleName={categories.name}
      level={2}
    />
  )
}

export async function generateMetadata({params}: {params: Promise<{secondCategoryName: string}>}) {
  const locale = await getCurrentLocale()
  const {secondCategoryName} = await params
  const slugToFind = secondCategoryName
  const foundCategory = await CategoriesService.getById('l2_' + slugToFind, locale || 'en')
  return {
    title: foundCategory?.name
  }
}

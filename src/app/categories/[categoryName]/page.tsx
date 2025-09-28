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
      `/companies/l1_${categoryName}`,
      {
        headers: {
          'Accept-Language': locale,
          'x-locale': locale
        }
      }
    )

    // console.log('curr lang:', locale)
    // console.log('data companyes:', data)
    companyes = data
  } catch {
    companyes = []
  }
  // console.log('companyes:', companyes)
  try {
    allCategories = await CategoriesService.getAll(locale || 'en')

    const slugToFind = categoryName
    const foundCategory = findCategoryBySlug(allCategories, slugToFind)
    // console.log('foundCategory', foundCategory)
    categories = foundCategory || (await CategoriesService.getById('l1_' + slugToFind, locale || 'en'))

    breadcrumbs = buildBreadcrumbs(allCategories, slugToFind)
  } catch (error) {
    console.log('EEEERRRROOOOOORRRRR', 'почему то выдаем 404', error)
    notFound()
  }

  console.log(
    'companyes',
    companyes,
    'breadcrumbs',
    breadcrumbs,
    'idOfFilter',
    categories.id,
    'categories',
    categories.children,
    'categoryName',
    categoryName,
    'categoryTitleName',
    categories.name,
    'level',
    1
  )

  return (
    <CategoryPage
      companyes={companyes || []}
      idOfFilter={categories.id}
      breadcrumbs={breadcrumbs}
      categories={categories.children}
      categoryName={categoryName}
      categoryTitleName={categories.name}
      level={1}
      language={locale}
    />
  )
}

export async function generateMetadata({params}: {params: Promise<{categoryName: string}>}) {
  try {
    const locale = await getCurrentLocale()
    const allCategories = await CategoriesService.getAll(locale || 'en')
    const {categoryName} = await params
    const slugToFind = categoryName
    const foundCategory = findCategoryBySlug(allCategories, slugToFind)

    return {
      title: foundCategory?.name || categoryName || 'category'
    }
  } catch {
    const {categoryName} = await params
    return {
      title: categoryName || 'category'
    }
  }
}

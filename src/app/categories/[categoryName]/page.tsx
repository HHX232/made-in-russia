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

  // Получаем компании для категории первого уровня
  let companyes: {name: string; inn: string; ageInYears: string}[]
  try {
    const {data} = await axiosClassic.get<{name: string; inn: string; ageInYears: string}[]>(
      `/companies/l1_${categoryName}`,
      {
        headers: {
          'Accept-Language': locale,
          'x-locale': locale
        }
      }
    )
    companyes = data
  } catch {
    companyes = []
  }

  try {
    allCategories = await CategoriesService.getAll(locale || 'en')

    const slugToFind = categoryName
    const foundCategory = findCategoryBySlug(allCategories, slugToFind)

    categories = foundCategory || (await CategoriesService.getById('l1_' + slugToFind, locale || 'en'))

    breadcrumbs = buildBreadcrumbs(allCategories, slugToFind)
  } catch (error) {
    console.error('Error loading category:', error)
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

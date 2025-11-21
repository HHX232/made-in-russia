// page.tsx (второй уровень)
import {getCurrentLocale} from '@/lib/locale-detection'
import {axiosClassic} from '@/api/api.interceptor'
import CategoryPage from '@/components/pages/CategoryPage/CategoryPage'
import CategoriesService from '@/services/categoryes/categoryes.service'
import {findCategoryByPath, buildBreadcrumbsByPath} from '@/utils/findCategoryPath'
import {notFound} from 'next/navigation'

export default async function CategoryPageSpecialSecond({
  params
}: {
  params: Promise<{categoryName: string; secondCategoryName: string}>
}) {
  const {categoryName, secondCategoryName} = await params
  let categories
  let allCategories
  let breadcrumbs: {title: string; link: string}[] = []
  const locale = await getCurrentLocale()

  // Полный путь от корня: level1 -> level2
  const fullPath = [categoryName, secondCategoryName]

  // Получаем компании для второго уровня
  let companyes: {name: string; inn: string; ageInYears: string}[]
  try {
    const {data} = await axiosClassic.get<{name: string; inn: string; ageInYears: string}[]>(
      `/companies/l2_${secondCategoryName}`,
      {
        headers: {
          'Accept-Language': locale,
          'x-locale': locale
        }
      }
    )
    companyes = data
  } catch {
    // Fallback на компании первого уровня
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
  }

  try {
    allCategories = await CategoriesService.getAll(locale || 'en')

    // КЛЮЧЕВОЕ: ищем по полному пути, а не по одному slug
    const foundCategory = findCategoryByPath(allCategories, fullPath)

    if (!foundCategory) {
      console.error('Category not found for path:', fullPath)
      notFound()
    }

    categories = foundCategory

    // Строим breadcrumbs по полному пути
    breadcrumbs = buildBreadcrumbsByPath(allCategories, fullPath)
  } catch (error) {
    console.error('Error loading category:', error)
    notFound()
  }

  return (
    <CategoryPage
      companyes={companyes || []}
      breadcrumbs={breadcrumbs}
      idOfFilter={categories.id}
      categories={categories.children || []}
      categoryName={secondCategoryName}
      categoryTitleName={categories.name} // name для заголовка страницы
      level={2}
      categoryDescription={categories.description}
      language={locale}
    />
  )
}

export async function generateMetadata({
  params
}: {
  params: Promise<{categoryName: string; secondCategoryName: string}>
}) {
  try {
    const locale = await getCurrentLocale()
    const {categoryName, secondCategoryName} = await params
    const allCategories = await CategoriesService.getAll(locale || 'en')

    const fullPath = [categoryName, secondCategoryName]
    const foundCategory = findCategoryByPath(allCategories, fullPath)

    return {
      title: foundCategory?.title || foundCategory?.name || secondCategoryName || 'category' // title для meta
    }
  } catch {
    const {secondCategoryName} = await params
    return {
      title: secondCategoryName || 'category'
    }
  }
}

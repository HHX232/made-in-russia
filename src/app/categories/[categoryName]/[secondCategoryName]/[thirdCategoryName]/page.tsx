import {getCurrentLocale} from '@/lib/locale-detection'
import {axiosClassic} from '@/api/api.interceptor'
import CategoryPage from '@/components/pages/CategoryPage/CategoryPage'
import CategoriesService from '@/services/categoryes/categoryes.service'
import {findCategoryByPath, buildBreadcrumbsByPath} from '@/utils/findCategoryPath'
import {notFound} from 'next/navigation'

export default async function CategoryPageSpecialThirdAlt({
  params,
  searchParams
}: {
  params: Promise<{
    categoryName: string
    secondCategoryName: string
    thirdCategoryName: string
    thirdCAtegoryName: string
  }>
  searchParams: Promise<{[key: string]: string | string[] | undefined}>
}) {
  const {categoryName, secondCategoryName, thirdCategoryName, thirdCAtegoryName} = await params
  const resolvedSearchParams = await searchParams

  // thirdCategoryName и thirdCAtegoryName - это один и тот же уровень (level 3)
  // один из них будет undefined в зависимости от роута
  const actualThirdSlug = thirdCategoryName || thirdCAtegoryName

  // Получаем lastFilterName из query параметров
  const lastFilterName = resolvedSearchParams?.lastFilterName as string | undefined

  let categories
  let allCategories
  let breadcrumbs: {title: string; link: string}[] = []
  const locale = await getCurrentLocale()

  // Полный путь от корня: level1 -> level2 -> level3
  const fullPath = [categoryName, secondCategoryName, actualThirdSlug]

  // Получаем компании для третьего уровня
  let companyes: {name: string; inn: string; ageInYears: string}[]
  try {
    const {data} = await axiosClassic.get<{name: string; inn: string; ageInYears: string}[]>(
      `/companies/l3_${actualThirdSlug}`,
      {
        headers: {
          'Accept-Language': locale,
          'x-locale': locale
        }
      }
    )
    companyes = data
  } catch {
    // Fallback на компании второго уровня
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
  }

  try {
    allCategories = await CategoriesService.getAll(locale || 'en')

    // КЛЮЧЕВОЕ: ищем по полному пути [categoryName, secondCategoryName, actualThirdSlug]
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
      idOfFilter={categories.id}
      breadcrumbs={breadcrumbs}
      categories={categories.children || []}
      categoryName={actualThirdSlug}
      categoryTitleName={categories.name}
      level={3}
      isShowPopulaTitle={false}
      language={locale}
      categoryDescription={categories.description}
      initialLastFilterSlug={lastFilterName}
    />
  )
}

export async function generateMetadata({
  params
}: {
  params: Promise<{
    categoryName: string
    secondCategoryName: string
    thirdCategoryName: string
    thirdCAtegoryName: string
  }>
}) {
  try {
    const locale = await getCurrentLocale()
    const {categoryName, secondCategoryName, thirdCategoryName, thirdCAtegoryName} = await params
    const actualThirdSlug = thirdCategoryName || thirdCAtegoryName
    const allCategories = await CategoriesService.getAll(locale || 'en')

    const fullPath = [categoryName, secondCategoryName, actualThirdSlug]
    const foundCategory = findCategoryByPath(allCategories, fullPath)

    return {
      title: foundCategory?.title || foundCategory?.name || actualThirdSlug || 'category' // title для meta
    }
  } catch {
    const {thirdCategoryName, thirdCAtegoryName} = await params
    const actualThirdSlug = thirdCategoryName || thirdCAtegoryName
    return {
      title: actualThirdSlug || 'category'
    }
  }
}

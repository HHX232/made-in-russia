/* eslint-disable @typescript-eslint/no-explicit-any */
// app/categories/[categoryName]/page.tsx
import {getCurrentLocale} from '@/lib/locale-detection'
import CategoryPage from '@/components/pages/CategoryPage/CategoryPage'
import CategoriesService from '@/services/categoryes/categoryes.service'
import {buildBreadcrumbs} from '@/utils/findCategoryPath'
import {notFound} from 'next/navigation'

interface PageProps {
  params: Promise<{categoryName: string}>
}

/**
 * Рекурсивно ищет категорию по slug и возвращает её с уровнем вложенности
 */
function findCategoryWithLevel(
  categories: any[],
  slug: string,
  currentLevel = 1
): {category: any; level: number} | null {
  for (const category of categories) {
    if (category.slug === slug) {
      return {category, level: currentLevel}
    }

    if (category.children && category.children.length > 0) {
      const found = findCategoryWithLevel(category.children, slug, currentLevel + 1)
      if (found) return found
    }
  }
  return null
}

/**
 * Определяет уровень категории, пытаясь загрузить её с разных уровней
 * Используется только если категория не найдена в allCategories
 */
async function detectCategoryLevelByApi(categorySlug: string, locale: string) {
  for (let level = 1; level <= 5; level++) {
    try {
      const categoryId = `l${level}_${categorySlug}`
      const category = await CategoriesService.getById(categoryId, locale)
      if (category) {
        return {level, category, categoryId}
      }
    } catch {
      continue
    }
  }
  return null
}

export default async function DynamicCategoryPage({params}: PageProps) {
  const {categoryName} = await params
  const locale = await getCurrentLocale()

  let categories
  let allCategories
  let breadcrumbs: {title: string; link: string}[] = []
  let level = 1
  let categoryId = ''

  try {
    // Получаем все категории
    allCategories = await CategoriesService.getAll(locale || 'en')

    // Сначала ищем в уже загруженных категориях
    const foundInTree = findCategoryWithLevel(allCategories, categoryName)

    if (foundInTree) {
      // Нашли в дереве категорий
      level = foundInTree.level
      categories = foundInTree.category
      categoryId = categories.id || `l${level}_${categoryName}`
    } else {
      // Не нашли в дереве, пробуем загрузить через API
      const detected = await detectCategoryLevelByApi(categoryName, locale || 'en')

      if (!detected) {
        notFound()
      }

      level = detected.level
      categoryId = detected.categoryId
      categories = detected.category
    }

    // Строим breadcrumbs
    breadcrumbs = buildBreadcrumbs(allCategories, categoryName)
  } catch (error) {
    console.error('Error loading category:', error)
    notFound()
  }

  const companyes: {name: string; inn: string; ageInYears: string}[] = []

  return (
    <CategoryPage
      companyes={companyes}
      idOfFilter={Number(categoryId) || 0}
      breadcrumbs={breadcrumbs}
      categories={categories.children || []}
      categoryName={categoryName}
      categoryTitleName={categories.label || categories.name}
      level={level}
      language={locale}
      categoryDescription={categories.description || ''}
    />
  )
}

export async function generateMetadata({params}: PageProps) {
  try {
    const locale = await getCurrentLocale()
    const {categoryName} = await params
    const allCategories = await CategoriesService.getAll(locale || 'en')

    const foundInTree = findCategoryWithLevel(allCategories, categoryName)

    if (foundInTree) {
      const foundCategory = foundInTree.category
      return {
        title: foundCategory.title || foundCategory.label || foundCategory.name || 'category',
        description: foundCategory.metaDescription || ''
      }
    }

    const detected = await detectCategoryLevelByApi(categoryName, locale || 'en')

    if (!detected) {
      return {
        title: categoryName || 'category',
        description: ''
      }
    }

    const foundCategory = detected.category
    return {
      title: foundCategory.title || foundCategory.label || foundCategory.name || 'category',
      description: foundCategory.metaDescription || ''
    }
  } catch {
    const {categoryName} = await params
    return {
      title: categoryName || 'category',
      description: ''
    }
  }
}

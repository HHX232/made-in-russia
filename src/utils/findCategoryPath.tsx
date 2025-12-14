/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Находит полный путь до категории по slug
 */
export function findCategoryPath(categories: any[], slug: string, path: any[] = []): any[] | null {
  for (const category of categories) {
    const newPath = [...path, category]

    if (category.slug === slug) {
      return newPath
    }

    if (category.children && category.children.length > 0) {
      const found = findCategoryPath(category.children, slug, newPath)
      if (found) return found
    }
  }
  return null
}

/**
 * Находит категорию по массиву slugs (путь от корня)
 * Например: ['ugol', 'ugol-i-antracit', 'ugol'] найдет правильную категорию на 3 уровне
 */
export function findCategoryByPath(categories: any[], slugPath: string[]): any | null {
  if (slugPath.length === 0) return null

  const currentSlug = slugPath[0]
  const category = categories.find((cat) => cat.slug === currentSlug)

  if (!category) return null

  // Если это последний slug в пути, возвращаем найденную категорию
  if (slugPath.length === 1) {
    return category
  }

  // Иначе ищем дальше в дочерних категориях
  if (category.children && category.children.length > 0) {
    return findCategoryByPath(category.children, slugPath.slice(1))
  }

  return null
}

/**
 * Находит категорию по одному slug (первое совпадение)
 * ВНИМАНИЕ: может найти неправильную категорию, если есть дубликаты slug
 */
export function findCategoryBySlug(categories: any[], slug: string): any | null {
  for (const category of categories) {
    if (category.slug === slug) {
      return category
    }
    if (category.children && category.children.length > 0) {
      const found = findCategoryBySlug(category.children, slug)
      if (found) return found
    }
  }
  return null
}

/**
 * Строит breadcrumbs по одному slug (находит путь автоматически)
 */
export function buildBreadcrumbs(allCategories: any[], slug: string) {
  const path = findCategoryPath(allCategories, slug)

  if (!path) return []

  let accumulatedPath = '/categories'
  const breadcrumbs = [
    {title: 'home', link: '/'},
    {title: 'categories', link: '/categories'},
    ...path.map((cat) => {
      accumulatedPath += `/${cat.slug}`
      return {
        title: cat.label || cat.name, // Используем label, если есть, иначе name
        link: accumulatedPath
      }
    })
  ]

  return breadcrumbs
}

/**
 * Строит breadcrumbs по массиву slugs (точный путь)
 * Используйте эту функцию для правильной работы с вложенными категориями
 */
export function buildBreadcrumbsByPath(allCategories: any[], slugPath: string[]) {
  if (slugPath.length === 0) return []

  let accumulatedPath = '/categories'
  const breadcrumbs = [
    {title: 'home', link: '/'},
    {title: 'categories', link: '/categories'}
  ]

  let currentCategories = allCategories

  for (const slug of slugPath) {
    const category = currentCategories.find((cat) => cat.slug === slug)
    if (!category) break

    accumulatedPath += `/${slug}`
    breadcrumbs.push({
      title: category.label || category.name, // label для breadcrumbs, fallback на name
      link: accumulatedPath
    })

    if (category.children && category.children.length > 0) {
      currentCategories = category.children
    } else {
      break
    }
  }

  return breadcrumbs
}

/**
 * Строит breadcrumbs для страницы товара
 */
export function buildBreadcrumbsForCard(allCategories: any[], slug: string, cardTitle: string) {
  const path = findCategoryPath(allCategories, slug)

  if (!path) return []

  // Собираем полный путь до последней категории
  let accumulatedPath = '/categories'
  for (const cat of path) {
    accumulatedPath += `/${cat.slug}`
  }

  const breadcrumbs = [
    {title: 'home', link: '/'},
    {title: 'categories', link: '/categories'},
    {
      title: path[path.length - 1].name,
      link: accumulatedPath
    },
    {
      title: cardTitle,
      link: '' // название товара — обычно без ссылки
    }
  ]

  return breadcrumbs
}

/**
 * Вычисляет уровень категории по массиву slugs
 */
export function getCategoryLevel(slugPath: string[]): number {
  return slugPath.length
}

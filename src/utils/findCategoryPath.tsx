/* eslint-disable @typescript-eslint/no-explicit-any */
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
        title: cat.name,
        link: accumulatedPath
      }
    })
  ]

  return breadcrumbs
}
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

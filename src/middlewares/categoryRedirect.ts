import {NextRequest, NextResponse} from 'next/server'

/**
 * Функция для обработки редиректов категорий
 * Преобразует старый формат URL /categories/parent/child/item
 * в новый формат /categories/item
 */
export const handleCategoryRedirect = (request: NextRequest, pathnameWithoutLocale: string): NextResponse | null => {
  if (!pathnameWithoutLocale.startsWith('/categories/')) {
    return null
  }

  const segments = pathnameWithoutLocale.split('/').filter(Boolean)

  if (segments.length > 2) {
    const categoryName = segments[segments.length - 1]

    const newPath = `/categories/${categoryName}`

    console.log(`Редирект категории: ${pathnameWithoutLocale} → ${newPath}`)

    const url = new URL(request.url)
    url.pathname = newPath

    return NextResponse.redirect(url, 301)
  }
  return null
}

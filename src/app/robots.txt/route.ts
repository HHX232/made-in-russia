import {NextResponse} from 'next/server'
import {axiosClassic} from '@/api/api.interceptor'
import {Category} from '@/services/categoryes/categoryes.service'

function cleanSlug(slug: string): string {
  return slug.replace(/^l[123]_/g, '').replace(/^l[123]-/g, '')
}

function collectEmptyCategorySlugs(categories: Category[]): string[] {
  const result: string[] = []

  const traverse = (cats: Category[]) => {
    for (const cat of cats) {
      const hasChildren = cat.children && cat.children.length > 0
      const isEmpty = !cat.productsCount || cat.productsCount === 0

      if (isEmpty) {
        result.push(cleanSlug(cat.slug))
      }

      if (hasChildren) {
        traverse(cat.children as Category[])
      }
    }
  }

  traverse(categories)
  return result
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL_SECOND || 'https://exporteru.com'

  let categoryDisallowLines = ''

  try {
    const response = await axiosClassic.get('/all-categories')
    const categories: Category[] = response.data

    const emptySlugs = collectEmptyCategorySlugs(categories)

    categoryDisallowLines = emptySlugs.map((slug) => `Disallow: /categories/${slug}`).join('\n')
  } catch (e) {
    console.error('Error loading categories for robots.txt', e)
  }

  const robotsTxt = `User-agent: *

${categoryDisallowLines ? categoryDisallowLines + '\n' : ''}

Disallow: /data-vendor
Disallow: /profile
Disallow: /register
Disallow: /favorites
Disallow: /create-card
Disallow: /basket
Disallow: /backend/*
Disallow: /admin/*
Disallow: /api/*
Disallow: /?

Sitemap: ${baseUrl}/sitemap.xml`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}

// src/app/sitemap-categories.xml/route.ts
import {axiosClassic} from '@/api/api.interceptor'
import {Category} from '@/services/categoryes/categoryes.service'
import {NextResponse} from 'next/server'

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function cleanSlug(slug: string): string {
  // Убираем префиксы l1_, l2_, l3_, l1-, l2-, l3-
  return slug.replace(/^l[123]_/g, '').replace(/^l[123]-/g, '')
}

function buildCategoryPath(category: Category, parentPath: string = ''): string {
  const cleanedSlug = cleanSlug(category.slug)
  return parentPath ? `${parentPath}/${cleanedSlug}` : cleanedSlug
}

function flattenCategories(
  categories: Category[],
  baseUrl: string,
  parentPath: string = ''
): Array<{url: string; lastModified: string; changeFrequency: string; priority: number}> {
  const urls: Array<{url: string; lastModified: string; changeFrequency: string; priority: number}> = []

  for (const category of categories) {
    const categoryPath = buildCategoryPath(category, parentPath)
    const fullUrl = `${baseUrl}/categories/${categoryPath}`

    // Определяем приоритет в зависимости от уровня вложенности
    const depth = categoryPath.split('/').length
    let priority = 0.7
    if (depth === 1) priority = 0.9
    else if (depth === 2) priority = 0.8
    else if (depth === 3) priority = 0.7

    urls.push({
      url: fullUrl,
      lastModified: new Date(category.lastModificationDate).toISOString(),
      changeFrequency: 'weekly',
      priority: priority
    })

    if (category.children && category.children.length > 0) {
      urls.push(...flattenCategories(category.children, baseUrl, categoryPath))
    }
  }

  return urls
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL_SECOND || 'http://localhost:3000'

  try {
    const response = await axiosClassic.get('/all-categories')
    const categories: Category[] = response.data

    const categoryUrls = flattenCategories(categories, baseUrl)

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${categoryUrls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.url)}</loc>
    <lastmod>${url.lastModified}</lastmod>
    <changefreq>${url.changeFrequency}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
  } catch (error) {
    console.error('Error generating categories sitemap:', error)

    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(baseUrl)}/categories</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`

    return new NextResponse(fallbackSitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=600, s-maxage=600'
      }
    })
  }
}

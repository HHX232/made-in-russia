// src/app/sitemap.xml/route.ts
import {axiosClassic} from '@/api/api.interceptor'
import {NextResponse} from 'next/server'

interface Product {
  id: string
  updatedAt: string
}

interface Vendor {
  id: string
  registeredAt: string
  updatedAt: string
}

interface SeoData {
  products: Product[]
  vendors: Vendor[]
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL_SECOND || 'https://exporteru.com'

  try {
    // Получаем динамические данные
    const response = await axiosClassic.get('/seo')
    const seoData: SeoData = response.data

    // Статические страницы с приоритетами
    const staticUrls = [
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 1.0
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.9
      },
      {
        url: `${baseUrl}/about-us`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly',
        priority: 0.6
      },
      {
        url: `${baseUrl}/help`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly',
        priority: 0.5
      },
      {
        url: `${baseUrl}/privacy`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'yearly',
        priority: 0.3
      },
      {
        url: `${baseUrl}/terms`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'yearly',
        priority: 0.3
      }
    ]

    // Динамические страницы продуктов (карточки)
    const productUrls = seoData.products.map((product) => ({
      url: `${baseUrl}/card/${product.id}`,
      lastModified: new Date(product.updatedAt).toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8
    }))

    // Динамические страницы вендоров
    const vendorUrls = seoData.vendors.map((vendor) => ({
      url: `${baseUrl}/data-vendor/${vendor.id}`,
      lastModified: new Date(vendor.updatedAt || vendor.registeredAt).toISOString(),
      changeFrequency: 'monthly',
      priority: 0.7
    }))

    const allUrls = [...staticUrls, ...productUrls, ...vendorUrls]

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
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
    console.error('Error generating sitemap:', error)

    // Возвращаем хотя бы статические страницы в случае ошибки
    const fallbackUrls = [
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 1.0
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.9
      },
      {
        url: `${baseUrl}/about-us`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly',
        priority: 0.6
      },
      {
        url: `${baseUrl}/help`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly',
        priority: 0.5
      },
      {
        url: `${baseUrl}/privacy`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'yearly',
        priority: 0.3
      },
      {
        url: `${baseUrl}/terms`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'yearly',
        priority: 0.3
      }
    ]

    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${fallbackUrls
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

    return new NextResponse(fallbackSitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
  }
}

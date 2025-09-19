// import {axiosClassic} from '@/api/api.interceptor'

// interface Product {
//   id: string
//   updatedAt: string
// }

// interface Vendor {
//   id: string
//   registeredAt: string
//   updatedAt: string
// }

// interface SeoData {
//   products: Product[]
//   vendors: Vendor[]
// }

// export default async function sitemap() {
//   try {
//     const response = await axiosClassic.get('/seo')
//     const seoData: SeoData = response.data
//     const baseUrl = process.env.NEXT_PUBLIC_API_URL_SECOND || 'https://exporteru.com'

//     const staticUrls = [
//       {
//         url: baseUrl,
//         lastModified: new Date(),
//         changeFrequency: 'daily' as const,
//         priority: 1
//       }
//     ]

//     const productUrls = seoData.products.map((product) => ({
//       url: `${baseUrl}/card/${product.id}`,
//       lastModified: new Date(product.updatedAt),
//       changeFrequency: 'weekly' as const,
//       priority: 0.8
//     }))

//     const vendorUrls = seoData.vendors.map((vendor) => ({
//       url: `${baseUrl}/data-vendor/${vendor.id}`,
//       lastModified: new Date(vendor.updatedAt || vendor.registeredAt),
//       changeFrequency: 'weekly' as const,
//       priority: 0.7
//     }))

//     return [...staticUrls, ...productUrls, ...vendorUrls]
//   } catch (error) {
//     console.error('Error generating sitemap:', error)
//     return []
//   }
// }

import {axiosClassic} from '@/api/api.interceptor'
import {MetadataRoute} from 'next'

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL_SECOND || 'https://exporteru.com'

  try {
    // Получаем данамические данные
    const response = await axiosClassic.get('/seo')
    const seoData: SeoData = response.data

    // Статические страницы с приоритетами
    const staticUrls: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9
      },
      {
        url: `${baseUrl}/about-us`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6
      },
      {
        url: `${baseUrl}/help`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5
      },
      {
        url: `${baseUrl}/privacy`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.3
      },
      {
        url: `${baseUrl}/terms`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.3
      }
    ]

    // Динамические страницы категорий (если есть список категорий)
    // Если у вас есть фиксированный список категорий, добавьте их здесь
    //  const categoryUrls: MetadataRoute.Sitemap = [
    // Пример:
    // {
    //   url: `${baseUrl}/categories/electronics`,
    //   lastModified: new Date(),
    //   changeFrequency: 'weekly',
    //   priority: 0.8,
    // },
    //  ]

    // Динамические страницы продуктов (карточки)
    const productUrls: MetadataRoute.Sitemap = seoData.products.map((product) => ({
      url: `${baseUrl}/card/${product.id}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.8
    }))

    // Динамические страницы вендоров (только для просмотра данных)
    const vendorUrls: MetadataRoute.Sitemap = seoData.vendors.map((vendor) => ({
      url: `${baseUrl}/data-vendor/${vendor.id}`,
      lastModified: new Date(vendor.updatedAt || vendor.registeredAt),
      changeFrequency: 'monthly',
      priority: 0.7
    }))

    return [...staticUrls, ...productUrls, ...vendorUrls]
  } catch (error) {
    console.error('Error generating sitemap:', error)

    // Возвращаем хотя бы статические страницы в случае ошибки
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9
      },
      {
        url: `${baseUrl}/about-us`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6
      },
      {
        url: `${baseUrl}/help`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5
      },
      {
        url: `${baseUrl}/privacy`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.3
      },
      {
        url: `${baseUrl}/terms`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.3
      }
    ]
  }
}

// Если у вас есть статический список категорий, можете добавить их:
/*
const CATEGORIES = [
  'electronics',
  'clothing', 
  'home-garden',
  'books',
  // ... другие категории
];

const categoryUrls: MetadataRoute.Sitemap = CATEGORIES.map(category => ({
  url: `${baseUrl}/categories/${category}`,
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.8,
}));
*/

import {MetadataRoute} from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL_SECOND || 'https://exporteru.com'

  return {
    rules: {
      userAgent: '*',
      allow: ['/card/*', '/data-vendor/*', '/categories/*', '/about-us', '/help', '/privacy', '/terms', '/login'],
      disallow: [
        '/',
        '/vendor',
        '/profile',
        '/register',
        '/favorites',
        '/create-card',
        '/basket',
        '/backend/*',
        '/admin/*',
        '/api/*',
        '/?'
      ]
    },
    sitemap: `${baseUrl}/sitemap.xml`
  }
}

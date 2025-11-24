import {NextResponse} from 'next/server'

export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL_SECOND || 'https://exporteru.com'

  const robotsTxt = `User-agent: *
Allow: /card/*
Allow: /data-vendor/*
Allow: /categories/*
Allow: /categories
Allow: /about-us
Allow: /help
Allow: /privacy
Allow: /terms
Allow: /login
Allow: /

Disallow: /vendor
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

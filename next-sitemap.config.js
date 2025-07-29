/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', // fallback для dev
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/404', '/500', '/api/*', '/admin/*'],
  sitemapBaseFileName: 'sitemap',
  generateIndexSitemap: false,

  additionalPaths: async () => [
    {
      loc: '/',
      changefreq: 'daily',
      priority: 1.0,
      lastmod: new Date().toISOString(),
    },
    // Добавьте здесь другие страницы, когда они появятся
    {
      loc: '/about',
      changefreq: 'weekly',
      priority: 0.9,
      lastmod: new Date().toISOString(),
    },
    {
      loc: '/card/*',
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    }
  ],

  transform: (config, path) => ({
    loc: path,
    changefreq: path === '/' ? 'daily' : config.changefreq,
    priority: path === '/' ? 1.0 : config.priority,
    lastmod: new Date().toISOString(),
  }),

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api'], // Раскомментировать позже
      },
    ],
  },
};
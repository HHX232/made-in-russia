// next.config.js
import type {NextConfig} from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

const CDN_FOLDER = process.env.NEXT_PUBLIC_CDN_FOLDER || '_next'
const CDN_URL = process.env.BUNNY_CDN_URL || ''
const isProduction = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,

  // Правильный assetPrefix
  assetPrefix: isProduction ? `${CDN_URL}/${CDN_FOLDER}` : '',

  images: {
    // ВАЖНО: убираем path для production или делаем правильно
    // ...(isProduction && {
    //   loader: 'custom',
    //   loaderFile: './image-loader.js' // Создадим кастомный лоадер
    // }),

    // Или используем unoptimized для простоты
    unoptimized: isProduction,

    domains: [
      'loremflickr.com',
      'www.aptronixindia.com',
      'lesoteka.com',
      'images.unsplash.com',
      'www.thekint.com',
      'example.com',
      'youtu.be',
      'v.ftcdn.net',
      'plus.unsplash.com',
      'res.cloudinary.com',
      'lh3.googleusercontent.com',
      '6e9e2c8a-521e-4620-9cf1-ef51353051d3.srvstatic.uz',
      't.me',
      'exporteru.b-cdn.net',
      'exporteru.com',
      'en.exporteru.com',
      'cn.exporteru.com'
    ]
  },

  async headers() {
    const cdnUrl = CDN_URL

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self' ${cdnUrl};
              script-src 'self' 'unsafe-inline' 'unsafe-eval' ${cdnUrl};
              style-src 'self' 'unsafe-inline' ${cdnUrl};
              style-src-elem 'self' 'unsafe-inline' ${cdnUrl};
              img-src 'self' data: blob: https: ${cdnUrl};
              font-src 'self' data: ${cdnUrl};
              connect-src 'self' ${cdnUrl} https://exporteru.com https://exporteru.b-cdn.net;
              frame-src 'self' ${cdnUrl};
              media-src 'self' blob: ${cdnUrl};
              worker-src 'self' blob: ${cdnUrl};
            `
              .replace(/\s+/g, ' ')
              .trim()
          }
        ]
      }
    ]
  }

  // УБИРАЕМ конфликтующий webpack config
  // webpack конфигурация не нужна, когда используется assetPrefix
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(withBundleAnalyzer(nextConfig))

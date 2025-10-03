// // next.config.ts
// import type {NextConfig} from 'next'
// import createNextIntlPlugin from 'next-intl/plugin'
// import bundleAnalyzer from '@next/bundle-analyzer'

// const withBundleAnalyzer = bundleAnalyzer({
//   enabled: process.env.ANALYZE === 'true'
// })

// const CDN_FOLDER = process.env.NEXT_PUBLIC_CDN_FOLDER || '_next'
// const CDN_URL = process.env.BUNNY_CDN_URL || ''
// const isProduction = process.env.NODE_ENV === 'production'

// const nextConfig: NextConfig = {
//   output: 'standalone',
//   reactStrictMode: true,

//   assetPrefix: isProduction ? `${CDN_URL}/${CDN_FOLDER}` : '',

//   images: {
//     ...(isProduction && {
//       loader: 'custom',
//       loaderFile: './image-loader.js'
//     }),
//     unoptimized: isProduction,
//     domains: [
//       'loremflickr.com',
//       'www.aptronixindia.com',
//       'lesoteka.com',
//       'images.unsplash.com',
//       'www.thekint.com',
//       'example.com',
//       'youtu.be',
//       'v.ftcdn.net',
//       'plus.unsplash.com',
//       'res.cloudinary.com',
//       'lh3.googleusercontent.com',
//       '6e9e2c8a-521e-4620-9cf1-ef51353051d3.srvstatic.uz',
//       't.me',
//       'exporteru.b-cdn.net',
//       'exporteru.com',
//       'en.exporteru.com',
//       'cn.exporteru.com'
//     ]
//   },

//   async headers() {
//     const cdnUrl = CDN_URL

//     return [
//       {
//         source: '/(.*)',
//         headers: [
//           {
//             key: 'Content-Security-Policy',
//             value: `
//               default-src 'self' ${cdnUrl};
//               script-src 'self' 'unsafe-inline' 'unsafe-eval' ${cdnUrl} https://exporteru.b-cdn.net https://telegram.org;
//               style-src 'self' 'unsafe-inline' ${cdnUrl} https://fonts.googleapis.com;
//               img-src 'self' data: blob: https: ${cdnUrl};
//               font-src 'self' data: ${cdnUrl} https://fonts.gstatic.com;
//               connect-src 'self' ${cdnUrl} https://exporteru.com https://en.exporteru.com https://cn.exporteru.com https://exporteru.b-cdn.net;
//               frame-src 'self' ${cdnUrl} https://telegram.org https://oauth.telegram.org;
//               media-src 'self' blob: ${cdnUrl};
//               worker-src 'self' blob: ${cdnUrl};
//             `
//               .replace(/\s+/g, ' ')
//               .trim()
//           }
//         ]
//       }
//     ]
//   }
// }

// const withNextIntl = createNextIntlPlugin()
// export default withNextIntl(withBundleAnalyzer(nextConfig))

import type {NextConfig} from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,

  images: {
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
      'TEMP_URL',
      'lh3.googleusercontent.com',
      '6e9e2c8a-521e-4620-9cf1-ef51353051d3.srvstatic.uz',
      't.me',
      'exporteru.b-cdn.net',
      'en.exporteru.com',
      'exporteru.com',
      'cn.exporteru.com'
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://exporteru.b-cdn.net https://telegram.org",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: https://exporteru.b-cdn.net https://telegram.org",
              "connect-src 'self' https://exporteru.com https://en.exporteru.com https://cn.exporteru.com https://exporteru.b-cdn.net",
              "frame-src 'self' https://telegram.org https://oauth.telegram.org",
              "font-src 'self' https://fonts.gstatic.com"
            ].join('; ')
          }
        ]
      }
    ]
  }
}

const withNextIntl = createNextIntlPlugin()

export default withNextIntl(withBundleAnalyzer(nextConfig))

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
//       'cn.exporteru.com',
//       'in.exporteru.com',
//       'i.pravatar.cc'
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
//             default-src 'self' ${cdnUrl};
//             script-src 'self' 'unsafe-inline' 'unsafe-eval'
//               ${cdnUrl}
//               https://exporteru.b-cdn.net
//               https://telegram.org
//               https://www.google.com
//               https://www.gstatic.com;
//             style-src 'self' 'unsafe-inline' ${cdnUrl} https://fonts.googleapis.com;
//             img-src 'self' data: blob: https: ${cdnUrl};
//             font-src 'self' data: ${cdnUrl} https://fonts.gstatic.com;
//             connect-src 'self' ${cdnUrl}
//               https://exporteru.com
//               https://en.exporteru.com
//               https://cn.exporteru.com
//               https://in.exporteru.com
//               wss://exporteru.com
//               wss://en.exporteru.com
//               wss://cn.exporteru.com
//               wss://in.exporteru.com
//               https://exporteru.b-cdn.net
//               https://www.google.com
//               https://www.gstatic.com;
//             frame-src 'self' ${cdnUrl}
//               https://telegram.org
//               https://oauth.telegram.org
//               https://www.google.com
//               https://www.gstatic.com;
//             media-src 'self' blob: ${cdnUrl};
//             worker-src 'self' blob: ${cdnUrl};
//           `
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
      'cn.exporteru.com',
      'i.pravatar.cc',
      'via.placeholder.com'
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
              "default-src * data: blob: 'unsafe-inline' 'unsafe-eval'",
              "script-src * data: blob: 'unsafe-inline' 'unsafe-eval'",
              "style-src * data: blob: 'unsafe-inline'",
              'img-src * data: blob:',
              'connect-src * ws: wss:',
              'frame-src *',
              'font-src * data:',
              'media-src *'
            ].join('; ')
          }
        ]
      }
    ]
  }
}

const withNextIntl = createNextIntlPlugin()

export default withNextIntl(withBundleAnalyzer(nextConfig))

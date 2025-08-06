import type {NextConfig} from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // webpack(config) {
  //   if (!config.optimization.splitChunks || typeof config.optimization.splitChunks === 'boolean') {
  //     config.optimization.splitChunks = {}
  //   }
  //   if (!config.optimization.splitChunks.cacheGroups) {
  //     config.optimization.splitChunks.cacheGroups = {}
  //   }

  //   config.optimization.splitChunks.cacheGroups = {
  //     ...config.optimization.splitChunks.cacheGroups,
  //     defaultVendors: {
  //       test: /[\\/]node_modules[\\/]/,
  //       priority: -10,
  //       reuseExistingChunk: true
  //     },
  //     mdEditor: {
  //       test: /[\\/]node_modules[\\/](md-editor-rt)[\\/]/,
  //       name: 'md-editor-rt',
  //       chunks: 'all',
  //       priority: 20
  //     },
  //     common: {
  //       name: 'commons',
  //       minChunks: 2,
  //       priority: -20,
  //       reuseExistingChunk: true
  //     }
  //   }

  //   return config
  // },
  images: {
    domains: [
      'loremflickr.com',
      'www.aptronixindia.com',
      'lesoteka.com',
      'images.unsplash.com',
      'www.thekint.com',
      'example.com',
      'images.unsplash.com',
      'youtu.be',
      'v.ftcdn.net',
      'plus.unsplash.com',
      'res.cloudinary.com',
      'TEMP_URL'
    ]
  }
}

const withNextIntl = createNextIntlPlugin()

// Apply the plugins in sequence
export default withNextIntl(withBundleAnalyzer(nextConfig))

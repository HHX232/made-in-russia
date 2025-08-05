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

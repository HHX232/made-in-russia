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
      'TEMP_URL',
      'https://lh3.googleusercontent.com',
      'https://6e9e2c8a-521e-4620-9cf1-ef51353051d3.srvstatic.uz',
      '6e9e2c8a-521e-4620-9cf1-ef51353051d3.srvstatic.uz',
      't.me'
    ]
  }
}

const withNextIntl = createNextIntlPlugin()

// Apply the plugins in sequence
export default withNextIntl(withBundleAnalyzer(nextConfig))

import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
  },
  outputFileTracingIncludes: {
    '/*': ['.env']
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerCompiles: true
  },
  reactStrictMode: true,
  images: {
    domains: ['loremflickr.com', 'www.aptronixindia.com', 'lesoteka.com', 'images.unsplash.com', 'www.thekint.com']
  }
}

export default nextConfig

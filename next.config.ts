import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['loremflickr.com', 'www.aptronixindia.com', 'lesoteka.com', 'images.unsplash.com', 'www.thekint.com']
  }
}

export default nextConfig

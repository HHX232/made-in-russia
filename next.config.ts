import type {NextConfig} from 'next'

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
      'res.cloudinary.com'
    ]
  }
}

export default nextConfig

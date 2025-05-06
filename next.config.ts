import type {NextConfig} from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['loremflickr.com', 'www.aptronixindia.com', 'lesoteka.com', 'images.unsplash.com', 'www.thekint.com']
  }
}
module.exports = {
  webpack: (config) => {
    config.resolve.alias['@/components'] = path.resolve(__dirname, 'src/components')
    return config
  }
}
export default nextConfig

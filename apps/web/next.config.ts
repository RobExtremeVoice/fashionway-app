import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@fashionway/shared'],
  images: {
    domains: ['res.cloudinary.com', 'storage.googleapis.com'],
  },
}

export default nextConfig

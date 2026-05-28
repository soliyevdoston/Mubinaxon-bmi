import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@edumind/ui', '@edumind/auth', '@edumind/database', '@edumind/types'],
  experimental: {
    serverActions: {
      allowedOrigins: ['admin.edumind.uz', 'localhost:3000'],
    },
  },
}

export default nextConfig

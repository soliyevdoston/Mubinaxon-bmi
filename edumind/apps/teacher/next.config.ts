import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: [
    '@edumind/ui',
    '@edumind/auth',
    '@edumind/database',
    '@edumind/types',
    '@edumind/ai',
  ],
  experimental: {
    serverActions: {
      allowedOrigins: ['teacher.edumind.uz', 'localhost:3001'],
    },
  },
}

export default nextConfig

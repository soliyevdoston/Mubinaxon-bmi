import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@edumind/ui', '@edumind/auth', '@edumind/database', '@edumind/types'],
  experimental: {
    serverActions: {
      allowedOrigins: ['student.edumind.uz', 'localhost:3002'],
    },
  },
}

export default nextConfig

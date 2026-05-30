import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  transpilePackages: ['@edumind/ui', '@edumind/auth', '@edumind/database', '@edumind/types', '@edumind/ai'],
  outputFileTracingRoot: path.join(__dirname, '../../'),
  experimental: {
    serverActions: {
      allowedOrigins: ['edumind.uz', 'localhost:3003'],
    },
  },
}

export default nextConfig

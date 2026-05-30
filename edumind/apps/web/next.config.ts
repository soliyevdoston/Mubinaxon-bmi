import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@edumind/ui', '@edumind/auth', '@edumind/database', '@edumind/types', '@edumind/ai'],
  outputFileTracingIncludes: {
    '**': ['./generated/client/**'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['edumind.uz', 'localhost:3003'],
    },
  },
}

export default nextConfig

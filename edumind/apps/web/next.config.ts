import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@edumind/ui', '@edumind/auth', '@edumind/database', '@edumind/types', '@edumind/ai'],
  outputFileTracingIncludes: {
    '**': ['../../packages/database/generated/client/**'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['edumind.uz', 'localhost:3003'],
    },
  },
}

export default nextConfig

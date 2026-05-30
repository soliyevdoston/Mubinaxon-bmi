import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@edumind/ui', '@edumind/auth', '@edumind/database', '@edumind/types', '@edumind/ai'],
  experimental: {
    serverActions: {
      allowedOrigins: ['edumind.uz', 'localhost:3003'],
    },
    outputFileTracingIncludes: {
      '**': ['../../packages/database/generated/client/**'],
    },
  },
}

export default nextConfig

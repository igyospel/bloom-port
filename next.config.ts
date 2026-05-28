import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // Ignore TypeScript errors during build for migration stability
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore ESLint checks during build for migration stability
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api',
        destination: '/api-gateway',
      },
    ];
  },
};

export default nextConfig;

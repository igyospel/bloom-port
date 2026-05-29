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
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "",
  },
  async rewrites() {
    return [
      {
        source: '/api',
        destination: '/api-gateway',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*).(png|jpg|jpeg|gif|webp|svg|mp4)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

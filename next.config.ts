import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gvyklepgmlyoyafxxmrz.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    dynamicIO: false,
    cacheLife: {
      default: {
        stale: 20,
        revalidate: 20,
        expire: 40,
      },
    },
  },
};

export default nextConfig;

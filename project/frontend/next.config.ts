import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/sounds/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=259200, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

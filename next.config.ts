import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'divyaastrovastu.com', pathname: '/uploads/**' },
      { protocol: 'https', hostname: '**.divyaastrovastu.com', pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      {
        protocol: 'https',
        hostname: 'backend-3kec.onrender.com',
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    const apiOrigin = process.env.API_PROXY_TARGET || 'http://localhost:4000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiOrigin}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiOrigin}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;

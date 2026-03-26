/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3332',
      },
    ],
    unoptimized: false,
    qualities: [30, 75],
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:3332/api/:path*',
      },
    ];
  },
};

export default nextConfig;
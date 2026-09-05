/** @type {import('next').NextConfig} */
const backendUrl = process.env.RENDER_API_BASE_URL || 'https://vistream.onrender.com';

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
        source: '/api-proxy/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;

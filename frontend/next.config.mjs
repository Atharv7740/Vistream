/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your original setting
  reactCompiler: true,

  // 💡 Suggested Addition for Image Fixes
  images: {
    // Allows images from the TMDb host
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
    // Allows the custom quality={30} used in your Image component
    qualities: [30, 75], 
  },
};

export default nextConfig;
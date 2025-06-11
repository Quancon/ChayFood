/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // appDir: true, // Removed as it's an unrecognized key
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'chayfood-server-production-42d6.up.railway.app',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'placekitten.com',
        port: '',
        pathname: '**',
      },
    ],
  },
}

module.exports = nextConfig 
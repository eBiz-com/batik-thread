/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Remote patterns for image optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'gbetxpvmtmnkbqtosjso.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig


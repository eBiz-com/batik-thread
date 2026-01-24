/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.pexels.com', 'gbetxpvmtmnkbqtosjso.supabase.co'],
    // Remote patterns for better image optimization
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


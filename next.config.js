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
  webpack: (config, { isServer }) => {
    // Ensure Stripe is only bundled on the server side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

module.exports = nextConfig


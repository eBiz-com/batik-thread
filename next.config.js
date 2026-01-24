/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.pexels.com', 'gbetxpvmtmnkbqtosjso.supabase.co'],
    // Allow base64 images (unoptimized) - needed for current storage method
    unoptimized: false,
    // Increase image quality for better display
    formats: ['image/webp', 'image/avif'],
  },
  // Enable compression
  compress: true,
}

module.exports = nextConfig


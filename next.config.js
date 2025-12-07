/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Enable experimental features for better performance
  experimental: {
    // Typed routes for improved type safety
    typedRoutes: true,
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly use webpack instead of Turbopack for compatibility
  experimental: {
    turbo: false,
  },
  // Disable Turbopack
  webpack: (config, { isServer }) => {
    return config
  },
}

module.exports = nextConfig

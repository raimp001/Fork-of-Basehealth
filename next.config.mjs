/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@coinbase/onchainkit"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // Ignore pino-pretty in the build
    config.resolve.alias = {
      ...config.resolve.alias,
      'pino-pretty': false
    }
    return config
  }
}

export default nextConfig

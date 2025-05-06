/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
    // Fix for pino-pretty not found
    config.resolve.alias['pino-pretty'] = false;
    return config;
  },
};

export default nextConfig;

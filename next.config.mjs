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
  experimental: {
    // Enable server actions with proper object syntax
    serverActions: {
      allowedOrigins: ['localhost:3000', 'vercel.app'],
    },
  },
  webpack: (config) => {
    // Fix for pino-pretty not found
    config.resolve.alias['pino-pretty'] = false;
    
    // Fixes npm packages that depend on Node.js modules
    if (!config.isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        zlib: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;

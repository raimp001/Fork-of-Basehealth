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
    unoptimized: false, // Enable optimization for better performance
  },
  // Empty turbopack config to suppress warning when using webpack
  turbopack: {},
  experimental: {
    // Enable server actions with proper object syntax
    serverActions: {
      allowedOrigins: ['localhost:3000', 'vercel.app', 'basehealth.xyz', 'www.basehealth.xyz'],
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
        '@solana-program/system': false,
        '@solana/web3.js': false,
      };
    }
    
    // Fix for @metamask/sdk
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    
    return config;
  },
  transpilePackages: ['@rainbow-me/rainbowkit', '@coinbase/wallet-sdk'],
};

export default nextConfig;

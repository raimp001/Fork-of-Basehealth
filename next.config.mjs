/** @type {import('next').NextConfig} */
import path from 'path'

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
    // Stub React Native async storage dependency pulled in by @metamask/sdk.
    // This avoids build-time "module not found" warnings in web bundles.
    config.resolve.alias['@react-native-async-storage/async-storage'] = path.resolve(
      process.cwd(),
      'lib/shims/async-storage.ts'
    )

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

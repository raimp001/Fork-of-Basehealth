#!/bin/bash

# BaseHealth Deployment Script
# This script automates the deployment process to Vercel with custom domain

set -e

echo "🚀 Starting BaseHealth deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI not found. Installing..."
    npm i -g vercel
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build the project locally to check for errors
echo "🔨 Building project..."
pnpm build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo ""
echo "Next steps:"
echo "1. Go to your Vercel dashboard"
echo "2. Navigate to your project settings"
echo "3. Add your custom domains:"
echo "   - basehealth.xyz"
echo "   - www.basehealth.xyz"
echo "4. Configure your DNS settings as instructed by Vercel"
echo ""
echo "🌐 Your site will be available at https://www.basehealth.xyz once DNS propagates" 
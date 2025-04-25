# BaseHealth V55 Migration Guide

This guide will help you migrate the existing BaseHealth repository to the V55 version with the healthcare AI agent features.

## Prerequisites

- Node.js 18+ installed
- Git installed
- Vercel account (for deployment)
- Access to the required API keys

## Step 1: Clone and Setup

\`\`\`bash
# Clone the repository
git clone https://github.com/raimp001/basehealth.git
cd basehealth

# Install dependencies
npm install
\`\`\`

## Step 2: Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`
COINBASE_CDP_API_KEY=your_coinbase_api_key
COINBASE_CDP_API_SECRET=your_coinbase_api_secret
OPENAI_API_KEY=your_openai_api_key
NETWORK_ID=base-sepolia
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

Note: For production, you'll need additional environment variables that should be set directly in your deployment platform's environment settings rather than in code.

## Step 3: Update Files

Replace the existing files with the new V55 versions:

1. Update `app/layout.tsx` with the new layout
2. Update `app/page.tsx` with the new homepage
3. Update `app/globals.css` with the new styles
4. Update `tailwind.config.ts` with the new configuration
5. Add all the new components in the `components` directory
6. Add all the new pages in the `app` directory

## Step 4: Test Locally

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to test the application.

## Step 5: Deploy to Vercel

\`\`\`bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Deploy to Vercel
vercel
\`\`\`

Follow the prompts to deploy your application.

## Step 6: Add Environment Variables to Vercel

In the Vercel dashboard:

1. Go to your project
2. Navigate to Settings > Environment Variables
3. Add all the environment variables from your `.env.local` file

## Step 7: Final Deployment

\`\`\`bash
vercel --prod
\`\`\`

Your BaseHealth V55 version should now be live!

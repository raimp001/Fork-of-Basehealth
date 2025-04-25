# Deploying BaseHealth to basehealth.xyz

This guide will help you deploy the BaseHealth application to your domain.

## Prerequisites

1. A Vercel account (https://vercel.com)
2. Your domain (basehealth.xyz) DNS access
3. The BaseHealth codebase

## Deployment Steps

### 1. Push your code to GitHub

First, push your code to a GitHub repository:

\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/basehealth.git
git push -u origin main
\`\`\`

### 2. Connect to Vercel

1. Log in to your Vercel account
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: next build
   - Output Directory: .next

### 3. Environment Variables

Add any necessary environment variables in the Vercel project settings:

- NEXT_PUBLIC_API_URL: Your API URL if applicable
- Any other environment variables your application needs

### 4. Deploy

Click "Deploy" and wait for the deployment to complete.

### 5. Connect Your Domain

1. Go to the "Domains" section in your Vercel project
2. Add your domain: basehealth.xyz
3. Follow Vercel's instructions to configure your DNS settings:
   - Add an A record pointing to Vercel's IP
   - Add a CNAME record for the www subdomain

### 6. SSL Certificate

Vercel will automatically provision an SSL certificate for your domain.

### 7. Verify Deployment

Visit your domain (basehealth.xyz) to verify that the deployment was successful.

## Troubleshooting

If you encounter any issues during deployment:

1. Check Vercel's deployment logs
2. Ensure your DNS settings are correct
3. Verify that all environment variables are properly set
4. Check for any build errors in your code

## Updating Your Site

To update your site after making changes:

1. Push your changes to GitHub
2. Vercel will automatically redeploy your site

## Custom Domain Email

Consider setting up custom domain email (e.g., info@basehealth.xyz) using a service like:
- Google Workspace
- Microsoft 365
- Zoho Mail

This will make your platform look more professional when communicating with users.
\`\`\`

Let's also create a tailwind.config.js file to ensure the styling is correct:

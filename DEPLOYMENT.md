# Deploying BaseHealth to www.basehealth.xyz

This guide will help you deploy the BaseHealth application to your custom domain **www.basehealth.xyz**.

## Quick Deployment (Recommended)

Use our automated deployment script:

```bash
./scripts/deploy.sh
```

## Manual Deployment Steps

### Prerequisites

1. A Vercel account (https://vercel.com) - **Free tier is sufficient**
2. Domain DNS access for basehealth.xyz
3. Vercel CLI installed: `npm i -g vercel`
4. The BaseHealth codebase pushed to GitHub

### 1. Initial Setup

First, ensure your code is on GitHub:

```bash
git add .
git commit -m "Prepare for www.basehealth.xyz deployment"
git push origin main
```

### 2. Deploy to Vercel

```bash
# Install dependencies
pnpm install

# Login to Vercel (first time only)
vercel login

# Deploy to production
vercel --prod
```

### 3. Configure Custom Domain

1. **In Vercel Dashboard:**
   - Go to your project settings
   - Navigate to "Domains" section
   - Add both domains:
     - `basehealth.xyz`
     - `www.basehealth.xyz`

2. **Configure DNS Settings:**
   
   In your domain registrar's DNS settings, add these records:

   ```
   Type: A
   Name: @
   Value: 76.76.19.61
   TTL: 3600

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

   > **Note:** Vercel will provide the exact IP and CNAME values in your dashboard

### 4. SSL Certificate & Final Steps

- Vercel automatically provisions SSL certificates
- DNS propagation takes 5-60 minutes
- Your site will be live at: **https://www.basehealth.xyz**

## Environment Variables (Optional)

If your app requires environment variables:

1. Go to Vercel Project Settings
2. Navigate to "Environment Variables"
3. Add any required variables:
   - `NEXT_PUBLIC_API_URL`
   - Database credentials (if applicable)
   - Third-party API keys

## Automatic Deployments

✅ **Already configured!** Every push to the `main` branch will trigger a new deployment.

## Domain Configuration Features

Our setup includes:

- ✅ Automatic redirect from `basehealth.xyz` → `www.basehealth.xyz`
- ✅ SSL/TLS encryption
- ✅ CDN optimization
- ✅ Security headers
- ✅ Performance optimizations

## Troubleshooting

### Common Issues:

1. **DNS not propagating:**
   - Wait up to 24 hours
   - Use `dig` command: `dig www.basehealth.xyz`

2. **Build errors:**
   - Check Vercel function logs
   - Verify environment variables
   - Test build locally: `pnpm build`

3. **Domain not working:**
   - Verify DNS records match Vercel's requirements
   - Check domain status in Vercel dashboard

### Verification Commands:

```bash
# Check DNS propagation
nslookup www.basehealth.xyz

# Test local build
pnpm build && pnpm start

# Check Vercel deployment status
vercel ls
```

## Professional Email Setup

Consider setting up professional email addresses:

- **info@basehealth.xyz** - General inquiries
- **support@basehealth.xyz** - Customer support
- **admin@basehealth.xyz** - Administrative use

**Recommended services:**
- Google Workspace ($6/user/month)
- Microsoft 365 ($5/user/month)
- Zoho Mail (Free tier available)

## Monitoring & Analytics

After deployment, consider adding:

- **Vercel Analytics** (built-in)
- **Google Analytics 4**
- **Uptime monitoring** (UptimeRobot, Pingdom)

🎉 **Your BaseHealth platform will be live at https://www.basehealth.xyz!**

For support, check the Vercel documentation or create an issue in this repository.

---

Made with ❤️ for BaseHealth

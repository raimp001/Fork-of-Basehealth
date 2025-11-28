# Deployment Guide - BaseHealth

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add production-ready vendor integrations"
   git push origin main
   ```

2. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Select your project (basehealth.xyz)

3. **Set Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Add all required variables (see checklist below)
   - Make sure to set them for **Production**, **Preview**, and **Development** environments

4. **Deploy**
   - Vercel will automatically deploy when you push to GitHub
   - Or click **Deploy** button in the dashboard

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

---

## Environment Variables Checklist

### Required Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://basehealth.xyz

# OpenAI (for AI features)
OPENAI_API_KEY=sk-...

# Healthcare Vendor Integration (when you have vendor credentials)
HEALTH_INTEGRATION_BASE_URL=https://api.your-vendor.com
HEALTH_INTEGRATION_API_KEY=your-vendor-api-key

# Optional but Recommended
NEXT_PUBLIC_BASE_URL=https://basehealth.xyz
```

### Optional Variables (Add as needed)

```bash
# Payment Processing
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Blockchain/Crypto
NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY=...
COINBASE_COMMERCE_WEBHOOK_SECRET=...
CDP_API_KEY_NAME=...
CDP_API_KEY_SECRET=...

# Third-party APIs
HEALTHDB_API_KEY=...
GOOGLE_PLACES_API_KEY=...
GOOGLE_MAPS_API_KEY=...
GOOGLE_GEOCODING_API_KEY=...

# Other
MCP_API_KEY=...
```

---

## Pre-Deployment Checklist

### ✅ Code Ready
- [ ] All changes committed to git
- [ ] Code pushed to GitHub
- [ ] No TypeScript errors (or they're ignored in build)
- [ ] No linting errors (or they're ignored in build)

### ✅ Environment Variables
- [ ] `DATABASE_URL` set (if using database)
- [ ] `NEXTAUTH_SECRET` set (generate new one: `openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` set to production URL
- [ ] `OPENAI_API_KEY` set (for AI features)
- [ ] `HEALTH_INTEGRATION_BASE_URL` set (if using vendor integrations)
- [ ] `HEALTH_INTEGRATION_API_KEY` set (if using vendor integrations)

### ✅ Database (if applicable)
- [ ] Database migrations run
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Database connection tested

### ✅ Build Test
- [ ] Local build succeeds: `npm run build`
- [ ] No build errors or warnings

---

## Deployment Steps

### 1. Commit and Push Code

```bash
# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "Deploy production-ready vendor integrations"

# Push to GitHub
git push origin main
```

### 2. Set Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - Click **Add New**
   - Enter variable name
   - Enter variable value
   - Select environments (Production, Preview, Development)
   - Click **Save**

### 3. Trigger Deployment

**Automatic (if connected to GitHub):**
- Push to `main` branch triggers automatic deployment

**Manual:**
- Go to **Deployments** tab
- Click **Redeploy** on latest deployment
- Or use Vercel CLI: `vercel --prod`

### 4. Monitor Deployment

- Watch build logs in Vercel dashboard
- Check for any build errors
- Verify deployment succeeded

### 5. Test Production Site

- Visit https://basehealth.xyz
- Test key features:
  - [ ] Provider signup works
  - [ ] Provider dashboard loads
  - [ ] AI chat works (if OPENAI_API_KEY set)
  - [ ] API routes respond correctly

---

## Post-Deployment

### Verify Everything Works

1. **Test Provider Signup**
   - Visit `/provider/signup`
   - Try signing up as both Physician and Health App
   - Verify email validation works

2. **Test Provider Dashboard**
   - Login as provider
   - Verify dashboard loads
   - Check profile information displays

3. **Test API Routes** (if vendor credentials set)
   - Test `/api/orders/lab` endpoint
   - Test `/api/orders/prescription` endpoint
   - Verify error handling works

4. **Test AI Features**
   - Visit `/chat`
   - Send a message
   - Verify PHI scrubbing works
   - Check response comes back

### Monitor Logs

- Check Vercel function logs for errors
- Monitor API route performance
- Watch for any vendor API errors

---

## Troubleshooting

### Build Fails

**Error: Missing environment variable**
- Solution: Add missing variable in Vercel dashboard

**Error: TypeScript errors**
- Check `next.config.mjs` - TypeScript errors are ignored during build
- Fix errors locally if possible

**Error: Module not found**
- Solution: Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

### Runtime Errors

**Error: Integration client requires environment variables**
- Solution: Set `HEALTH_INTEGRATION_BASE_URL` and `HEALTH_INTEGRATION_API_KEY` in Vercel

**Error: Database connection failed**
- Solution: Verify `DATABASE_URL` is correct in Vercel
- Check database allows connections from Vercel IPs

**Error: API route returns 500**
- Check Vercel function logs
- Verify all required environment variables are set
- Check vendor API credentials are correct

### Common Issues

**"Vendor API error: 401"**
- API key is incorrect or expired
- Check `HEALTH_INTEGRATION_API_KEY` in Vercel

**"Vendor API error: 404"**
- Base URL is incorrect
- Check `HEALTH_INTEGRATION_BASE_URL` in Vercel
- Verify endpoint paths match vendor documentation

**"Integration client requires environment variables"**
- Missing `HEALTH_INTEGRATION_BASE_URL` or `HEALTH_INTEGRATION_API_KEY`
- Set them in Vercel dashboard

---

## Rollback

If deployment has issues:

1. **Via Vercel Dashboard:**
   - Go to **Deployments** tab
   - Find previous working deployment
   - Click **⋯** → **Promote to Production**

2. **Via Git:**
   ```bash
   git revert HEAD
   git push origin main
   ```

---

## Production Checklist

Before going live:

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Domain configured (basehealth.xyz)
- [ ] Error monitoring set up (optional)
- [ ] Analytics configured (optional)
- [ ] Vendor BAAs signed (if using integrations)
- [ ] Vendor API credentials obtained (if using integrations)
- [ ] Test all critical features
- [ ] Monitor first few deployments

---

## Quick Commands

```bash
# Build locally to test
npm run build

# Deploy to Vercel
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Open production site
vercel open
```

---

*Ready to deploy! 🚀*


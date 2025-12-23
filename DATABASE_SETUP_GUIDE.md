# Database Setup Guide for Provider Signup

## Critical: Database Configuration Required

The provider signup requires a PostgreSQL database connection. If you're seeing "Database connection error", follow these steps:

## Step 1: Set Up Database in Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `basehealth-platform`

2. **Add Environment Variable**
   - Go to: **Settings** → **Environment Variables**
   - Click **Add New**
   - Name: `DATABASE_URL`
   - Value: Your PostgreSQL connection string
   - Format: `postgresql://username:password@host:port/database?schema=public`
   - Select environments: **Production**, **Preview**, **Development**
   - Click **Save**

## Step 2: Database Options

### Option A: Use Vercel Postgres (Recommended)
1. In Vercel Dashboard, go to **Storage** tab
2. Click **Create Database**
3. Select **Postgres**
4. Choose a plan (Hobby plan is free)
5. Copy the `POSTGRES_URL` connection string
6. Use it as `DATABASE_URL` in Environment Variables

### Option B: Use External PostgreSQL Database
1. Get connection string from your database provider (e.g., Supabase, Neon, Railway)
2. Format: `postgresql://user:password@host:port/database?schema=public`
3. Add as `DATABASE_URL` in Vercel Environment Variables

## Step 3: Run Database Migrations

After setting DATABASE_URL, you need to run Prisma migrations:

### Option A: Add to Build Command (Recommended)
Add this to your `package.json`:

```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

### Option B: Run Manually
In Vercel Dashboard → Deployments → Latest → Settings → Build Command:
```
prisma generate && prisma migrate deploy && next build
```

## Step 4: Verify Database Connection

After deployment, check Vercel function logs:
1. Go to Vercel Dashboard → Deployments → Latest
2. Click on **Functions** tab
3. Find `/api/provider/register`
4. Check logs for any database errors

## Common Database Connection Strings

### Vercel Postgres:
```
postgres://default:password@host.vercel-storage.com:5432/verceldb
```

### Supabase:
```
postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
```

### Neon:
```
postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb
```

## Troubleshooting

### Error: "Database connection error"
- ✅ Check DATABASE_URL is set in Vercel
- ✅ Verify connection string format is correct
- ✅ Ensure database is accessible from internet
- ✅ Check database credentials are correct

### Error: "Table 'providers' does not exist"
- ✅ Run Prisma migrations: `npx prisma migrate deploy`
- ✅ Or add to build command (see Step 3)

### Error: "Prisma Client not generated"
- ✅ Add `prisma generate` to build command
- ✅ Or run manually before deployment

## Quick Fix Script

Add this to `package.json` scripts:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

This ensures:
1. Prisma client is generated after npm install
2. Migrations run before build
3. Build completes successfully

## Testing After Setup

1. Go to: https://www.basehealth.xyz/provider/signup
2. Fill in the form:
   - Full Name: "Dr. Test User"
   - Email: "test@example.com"
   - Password: "test123456"
   - NPI: "1234567890"
   - License Number: "12345"
   - License State: "CA"
3. Submit and check for success message

## Still Having Issues?

1. Check Vercel function logs for exact error
2. Verify DATABASE_URL format is correct
3. Test database connection locally:
   ```bash
   export DATABASE_URL="your-connection-string"
   npx prisma migrate deploy
   npx prisma studio
   ```
4. Contact support with error details from logs

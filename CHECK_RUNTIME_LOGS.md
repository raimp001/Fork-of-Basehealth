# How to Check Runtime Logs in Vercel

## Step 1: Go to Runtime Logs

1. **Open Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `basehealth-platform`

2. **Click on the latest deployment** (the one marked "Ready Latest")

3. **Look for "Runtime Logs" section**
   - It might be labeled as "Functions" or "Logs"
   - Click on it to open

4. **Filter for provider registration**
   - Look for `/api/provider/register` in the logs
   - Or search for "provider" or "register"

## Step 2: Test While Watching Logs

1. **Keep the Runtime Logs open** in one browser tab
2. **Open another tab** with `https://www.basehealth.xyz/provider/signup`
3. **Try to sign up** as a provider
4. **Watch the logs** in real-time for errors

## Step 3: What to Look For

Look for errors like:
- `DATABASE_URL` not set
- `P1001` - Database connection error
- `P2002` - Unique constraint violation (email/NPI already exists)
- `P2003` - Foreign key constraint error
- Any Prisma errors
- Any error messages related to database

## Step 4: Test Database Connection

Visit this URL to test if database is connected:
```
https://www.basehealth.xyz/api/provider/test-db
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "providerCount": 0,
  "databaseUrl": "Set (hidden)"
}
```

**If it fails:**
- You'll see `"databaseUrl": "NOT SET - This is the problem!"`
- This means `DATABASE_URL` is not configured in Vercel

## Step 5: Check Environment Variables

1. **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. **Look for `DATABASE_URL`**
3. **If it's missing**, you need to add it:
   - Click "Add New"
   - Name: `DATABASE_URL`
   - Value: Your PostgreSQL connection string
   - Format: `postgresql://user:password@host:port/database?schema=public`
   - Select: Production, Preview, Development
   - Click "Save"
   - **Redeploy** after adding

## Most Likely Issue

Based on the error "something related to database API etc", the most likely problem is:

**`DATABASE_URL` environment variable is not set in Vercel**

This would cause:
- Database connection failures
- Provider registration to fail
- Generic error messages

## Quick Fix

1. **Add `DATABASE_URL`** in Vercel Settings → Environment Variables
2. **Redeploy** (or wait for auto-deploy)
3. **Test again** at `/api/provider/test-db`
4. **Try signing up** again

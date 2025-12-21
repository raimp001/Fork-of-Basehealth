# Troubleshooting Provider Registration Error

## Issue
"Registration failed. Please try again." error when trying to register as a provider.

## Possible Causes

### 1. Database Connection Issue (Most Likely)
- **Symptom:** Generic error message
- **Solution:** Check Vercel environment variables:
  - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
  - Ensure `DATABASE_URL` is set correctly
  - Format: `postgresql://user:password@host:port/database?schema=public`

### 2. Prisma Client Not Generated
- **Symptom:** Prisma-related errors
- **Solution:** Run migrations:
  ```bash
  npx prisma generate
  npx prisma migrate deploy
  ```

### 3. Database Schema Not Migrated
- **Symptom:** Column/table not found errors
- **Solution:** Run database migrations:
  ```bash
  npx prisma migrate deploy
  ```

### 4. Missing Environment Variables
Required variables in Vercel:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secret for JWT tokens

## Quick Fix Steps

1. **Check Vercel Environment Variables:**
   - Visit: https://vercel.com/dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Verify `DATABASE_URL` is set

2. **Check Database Connection:**
   - Ensure your database is accessible
   - Verify connection string is correct
   - Check if database server is running

3. **Run Database Migrations:**
   - In Vercel, you may need to run migrations manually
   - Or set up a migration script in your build process

4. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Deployments
   - Click on latest deployment
   - Check "Functions" tab for API route logs
   - Look for specific error messages

## Testing Locally

To test if it's a deployment issue:

```bash
# Set up local database
export DATABASE_URL="your-local-database-url"

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Test registration
npm run dev
```

## Next Steps

1. Check Vercel function logs for the exact error
2. Verify DATABASE_URL is set in Vercel
3. Ensure database migrations have been run
4. Check if database is accessible from Vercel's servers

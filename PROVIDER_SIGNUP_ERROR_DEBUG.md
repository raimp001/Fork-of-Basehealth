# Provider Signup Error Debugging Guide

## Quick Diagnostic Steps

### Step 1: Test Database Connection
Visit this URL to check if your database is connected:
```
https://www.basehealth.xyz/api/provider/test-db
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "Database connection successful",
  "providerCount": 0,
  "databaseUrl": "Set (hidden)",
  "timestamp": "2025-12-23T..."
}
```

**If you see an error:**
- Check Vercel Dashboard → Settings → Environment Variables
- Ensure `DATABASE_URL` is set
- Format: `postgresql://user:password@host:port/database?schema=public`

### Step 2: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to sign up
4. Look for error messages starting with "Registration error:"

### Step 3: Check Vercel Logs
1. Go to Vercel Dashboard
2. Select your project
3. Go to Deployments → Latest
4. Click "Functions" tab
5. Find `/api/provider/register`
6. Check logs for detailed error messages

## Common Error Messages and Solutions

### "Database connection failed"
**Cause:** DATABASE_URL not set or incorrect

**Solution:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `DATABASE_URL` with your PostgreSQL connection string
3. Redeploy

### "Email already registered" (409)
**Cause:** Email already exists in database

**Solution:**
- Use a different email address
- Or delete the existing provider from database

### "NPI number already registered" (409)
**Cause:** NPI already exists in database

**Solution:**
- Use a different NPI number (if testing)
- Or delete the existing provider with that NPI

### "NPI number must be exactly 10 digits" (400)
**Cause:** Invalid NPI format

**Solution:**
- Ensure NPI is exactly 10 digits
- No spaces, dashes, or letters
- Example: `1234567890` ✅

### "License state must be exactly 2 letters" (400)
**Cause:** Invalid state code format

**Solution:**
- Use 2-letter state code (e.g., CA, NY, TX)
- No spaces or numbers
- Example: `CA` ✅

### "Failed to create provider account" (500)
**Cause:** Database error during creation

**Solution:**
1. Check the error `details` field in the response
2. Check Vercel function logs
3. Verify database schema matches Prisma schema
4. Run migrations: `npx prisma migrate deploy`

### "Too many registration attempts" (429)
**Cause:** Rate limit exceeded (3 attempts per hour)

**Solution:**
- Wait 1 hour
- Or use a different IP/browser

## Testing the Registration API Directly

You can test the API endpoint directly using curl:

```bash
curl -X POST https://www.basehealth.xyz/api/provider/register \
  -H "Content-Type: application/json" \
  -d '{
    "type": "PHYSICIAN",
    "fullName": "Dr. Test User",
    "email": "test@example.com",
    "password": "testpassword123",
    "npi": "1234567890",
    "licenseNumber": "MD12345",
    "licenseState": "CA"
  }'
```

## What to Check Next

1. **Database Connection:** Test with `/api/provider/test-db`
2. **Environment Variables:** Verify DATABASE_URL in Vercel
3. **Database Migrations:** Ensure Prisma migrations are run
4. **Browser Console:** Check for client-side errors
5. **Vercel Logs:** Check server-side errors

## Still Not Working?

If you're still seeing errors:
1. Copy the exact error message from browser console
2. Check Vercel function logs for the same request
3. Share both error messages for further debugging

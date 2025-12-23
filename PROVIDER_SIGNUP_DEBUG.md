# Provider Signup Debugging Guide

## Common Issues and Solutions

### 1. "Database connection error"
**Cause:** DATABASE_URL not set in Vercel or database is not accessible

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `DATABASE_URL` with your PostgreSQL connection string
3. Format: `postgresql://user:password@host:port/database?schema=public`
4. Redeploy the application

### 2. "Email already registered" or "NPI already registered"
**Cause:** Provider with this email or NPI already exists in database

**Solution:**
- Use a different email address
- Use a different NPI number (if testing)
- Or delete the existing provider from database

### 3. "NPI number must be exactly 10 digits"
**Cause:** NPI validation failed

**Solution:**
- Ensure NPI is exactly 10 digits (no spaces, dashes, or letters)
- Example: `1234567890` ✅
- Example: `123-456-7890` ❌

### 4. "License state must be exactly 2 letters"
**Cause:** License state validation failed

**Solution:**
- Use 2-letter state code (e.g., CA, NY, TX)
- No spaces or numbers allowed
- Example: `CA` ✅
- Example: `California` ❌

### 5. "Registration failed. Please try again."
**Cause:** Generic error - could be multiple issues

**Solution:**
1. Check browser console for detailed error
2. Check Vercel function logs:
   - Go to Vercel Dashboard → Deployments → Latest → Functions
   - Look for `/api/provider/register` logs
3. Verify all required fields are filled:
   - Full Name
   - Email
   - Password (min 8 characters)
   - NPI (10 digits)
   - License Number
   - License State (2 letters)

## Testing the API Directly

You can test the API endpoint directly:

```bash
curl -X POST https://www.basehealth.xyz/api/provider/register \
  -H "Content-Type: application/json" \
  -d '{
    "type": "PHYSICIAN",
    "email": "test@example.com",
    "password": "test123456",
    "fullName": "Dr. Test User",
    "npi": "1234567890",
    "licenseNumber": "12345",
    "licenseState": "CA"
  }'
```

## Required Fields for Physician Signup

- ✅ `type`: "PHYSICIAN"
- ✅ `email`: Valid email address
- ✅ `password`: Minimum 8 characters
- ✅ `fullName`: Provider's full name
- ✅ `npi`: Exactly 10 digits (required)
- ✅ `licenseNumber`: State medical board license number (required)
- ✅ `licenseState`: 2-letter state code (required)
- ⚪ `phone`: Optional
- ⚪ `bio`: Optional
- ⚪ `specialties`: Optional array

## Checking Vercel Logs

1. Go to: https://vercel.com/dashboard
2. Select your project: `basehealth-platform`
3. Click on latest deployment
4. Go to "Functions" tab
5. Find `/api/provider/register`
6. Check logs for specific error messages

## Database Migration Check

If database schema is not up to date:

```bash
# In Vercel, you may need to run migrations manually
npx prisma migrate deploy
```

Or add to `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

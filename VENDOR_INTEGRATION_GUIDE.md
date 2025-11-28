# Healthcare Vendor Integration Guide

## Simple Explanation: How Your Backend Talks to Real Vendors

### The Big Picture

Think of your backend as a **translator** between your website and healthcare vendors (like Redox, Particle Health, etc.):

1. **Provider clicks a button** on your website (e.g., "Order Lab Test")
2. **Your website sends a request** to your backend API route
3. **Your backend translates** the request into the vendor's format
4. **Your backend calls the vendor** using their API
5. **Vendor responds** with the result
6. **Your backend sends the result** back to your website

All of this happens securely on your backend - **never in the browser**.

---

## How It Works Step-by-Step

### Example: Ordering a Lab Test

**1. Provider clicks "Order Lab Test" button**
```
Provider Dashboard → Button Click
```

**2. Frontend sends request to your API**
```javascript
// Frontend code (simplified)
fetch('/api/orders/lab', {
  method: 'POST',
  body: JSON.stringify({
    patientId: 'internal-patient-123',
    providerId: 'internal-provider-456',
    testCodes: ['24323-8'], // LOINC code for CBC
    testNames: ['Complete Blood Count'],
    priority: 'routine'
  })
})
```

**3. Your API route receives the request**
```typescript
// app/api/orders/lab/route.ts
POST /api/orders/lab
```

**4. API route calls the integration client**
```typescript
// Calls lib/integrations/labs.ts
const result = await createLabOrder(orderData)
```

**5. Integration client makes HTTP call to vendor**
```typescript
// lib/integrations/baseClient.ts
// Reads from environment variables:
// - HEALTH_INTEGRATION_BASE_URL (e.g., https://api.redoxengine.com)
// - HEALTH_INTEGRATION_API_KEY (your vendor API key)

POST https://api.redoxengine.com/orders/lab
Headers:
  Authorization: Bearer your-api-key-here
  Content-Type: application/json
Body:
  {
    "patientId": "internal-patient-123",
    "providerId": "internal-provider-456",
    "tests": [...]
  }
```

**6. Vendor processes and responds**
```json
{
  "orderId": "LAB-789",
  "status": "sent",
  "estimatedCompletionDate": "2024-01-15T10:00:00Z"
}
```

**7. Response flows back to provider**
```
Vendor → Integration Client → API Route → Frontend → Provider Dashboard
```

---

## How a Provider Triggers These APIs

### From the Provider Dashboard

When a provider logs into `/provider/dashboard`, they'll see buttons like:

1. **"Order Lab Test"** button
   - Provider fills out form: patient, test type, priority
   - Clicks "Submit"
   - Frontend calls `POST /api/orders/lab`
   - Lab order is sent to vendor
   - Provider sees confirmation: "Lab order placed successfully"

2. **"Send Prescription"** button
   - Provider fills out form: patient, medication, dosage, frequency
   - Clicks "Submit"
   - Frontend calls `POST /api/orders/prescription`
   - Prescription is sent to pharmacy via vendor
   - Provider sees confirmation: "Prescription sent successfully"

3. **"Order Imaging Study"** button
   - Provider fills out form: patient, study type (CT/MRI/X-Ray), body part
   - Clicks "Submit"
   - Frontend calls `POST /api/orders/imaging`
   - Imaging order is sent to radiology facility via vendor
   - Provider sees confirmation: "Imaging order scheduled"

4. **"Push Clinical Summary to EMR"** button
   - Provider fills out form: patient, diagnosis, notes, vitals
   - Clicks "Submit"
   - Frontend calls `POST /api/orders/emr-summary`
   - Clinical summary is pushed to patient's EMR via vendor
   - Provider sees confirmation: "Clinical summary pushed successfully"

---

## Environment Variables Explained

### What You Need

Before you can use real vendors, you need to set these environment variables:

```bash
# Base URL of your vendor's API
HEALTH_INTEGRATION_BASE_URL=https://api.redoxengine.com
# Or: https://api.particlehealth.com
# Or: https://api.zushealth.com
# (Get this from your vendor)

# Your API key/token from the vendor
HEALTH_INTEGRATION_API_KEY=sk_live_abc123xyz789...
# (Get this from your vendor after signing BAA)

# Optional: Request timeout (default is 30 seconds)
HEALTH_INTEGRATION_TIMEOUT=30000
```

### Where to Set Them

**Local Development:**
- Create `.env.local` file in project root
- Add the variables above
- Never commit this file to git!

**Vercel Production:**
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable
5. Redeploy your app

---

## What Happens Behind the Scenes

### The Base Client (`lib/integrations/baseClient.ts`)

This is the "translator" that talks to vendors:

```typescript
// It reads environment variables
const baseUrl = process.env.HEALTH_INTEGRATION_BASE_URL
const apiKey = process.env.HEALTH_INTEGRATION_API_KEY

// Makes HTTP requests
POST https://api.vendor.com/orders/lab
Headers:
  Authorization: Bearer {apiKey}
  Content-Type: application/json
Body: { ... order data ... }
```

### Error Handling

If something goes wrong:
- **Network error** → Returns error message
- **Vendor API error** → Returns vendor's error message
- **Timeout** → Returns timeout error
- **Invalid credentials** → Returns 401 error

All errors are logged (without PHI) and returned to the frontend.

---

## Security & HIPAA Compliance

### ✅ What's Secure

1. **API keys never leave the backend**
   - Stored in environment variables
   - Never sent to browser
   - Never logged or exposed

2. **All communications encrypted**
   - Uses HTTPS only
   - Vendor APIs require HTTPS

3. **PHI only sent from backend**
   - Frontend never directly calls vendor APIs
   - All vendor calls go through your backend
   - Backend validates and sanitizes data

4. **Uses internal IDs**
   - Your system uses internal patient/provider IDs
   - Vendor maps these to their records
   - No real-world identifiers exposed

### ⚠️ What You Must Do

1. **Sign BAAs** with vendors before production
2. **Use sandbox credentials** for testing
3. **Never hard-code** API keys or URLs
4. **Monitor API calls** for errors
5. **Handle vendor-specific** response formats

---

## Example: Complete Flow

### Scenario: Provider Orders a Lab Test

```
┌─────────────────┐
│ Provider        │
│ Dashboard       │
└────────┬────────┘
         │
         │ 1. Clicks "Order Lab Test"
         │    Fills form: Patient, Test Type
         │
         ▼
┌─────────────────┐
│ Frontend        │
│ (Browser)       │
└────────┬────────┘
         │
         │ 2. POST /api/orders/lab
         │    { patientId, providerId, testCodes }
         │
         ▼
┌─────────────────┐
│ API Route       │
│ /api/orders/lab │
└────────┬────────┘
         │
         │ 3. Validates request
         │    Calls createLabOrder()
         │
         ▼
┌─────────────────┐
│ Integration     │
│ Client          │
│ (baseClient.ts) │
└────────┬────────┘
         │
         │ 4. Reads env vars:
         │    HEALTH_INTEGRATION_BASE_URL
         │    HEALTH_INTEGRATION_API_KEY
         │
         │ 5. POST https://api.vendor.com/orders/lab
         │    Authorization: Bearer {apiKey}
         │    Body: { ... order data ... }
         │
         ▼
┌─────────────────┐
│ Vendor API      │
│ (Redox/Particle)│
└────────┬────────┘
         │
         │ 6. Processes order
         │    Returns: { orderId, status }
         │
         ▼
┌─────────────────┐
│ Integration     │
│ Client          │
│ (baseClient.ts) │
└────────┬────────┘
         │
         │ 7. Returns vendor response
         │
         ▼
┌─────────────────┐
│ API Route       │
│ /api/orders/lab │
└────────┬────────┘
         │
         │ 8. Returns JSON response
         │
         ▼
┌─────────────────┐
│ Frontend        │
│ (Browser)       │
└────────┬────────┘
         │
         │ 9. Shows success message
         │    "Lab order placed successfully"
         │
         ▼
┌─────────────────┐
│ Provider        │
│ Dashboard       │
└─────────────────┘
```

---

## Next Steps

1. **Choose a vendor** (Redox, Particle Health, Zus, etc.)
2. **Contact vendor** to sign BAA and get credentials
3. **Get sandbox API keys** for testing
4. **Set environment variables** in `.env.local` (local) or Vercel (production)
5. **Test integrations** using sandbox credentials
6. **Switch to production** credentials when ready

---

## Questions?

- **"How do I get API keys?"** → Contact your vendor after signing BAA
- **"What if vendor API format is different?"** → Modify the integration client to match vendor's format
- **"Can I use multiple vendors?"** → Yes, but you'll need separate environment variables or vendor selection logic
- **"What about webhooks?"** → Vendors may send webhooks for status updates - you'll need to add webhook handlers

---

*All integration code is production-ready and waiting for your vendor credentials!*


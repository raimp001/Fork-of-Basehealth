# Base Blockchain Payments Integration

## Overview

This document describes the integration of **Base blockchain payments** with **HTTP 402 Payment Required protocol** using Coinbase's infrastructure for BaseHealth.

## Architecture

### Components

1. **HTTP 402 Service** (`lib/http-402-service.ts`)
   - Implements HTTP 402 Payment Required protocol
   - Verifies payment proofs on Base blockchain
   - Manages payment requirements and tiers
   - Records payment transactions

2. **Base CDS Payment Component** (`components/payment/base-cds-payment.tsx`)
   - React component for accepting USDC/ETH payments
   - Integrates with Coinbase Wallet via wagmi
   - Supports Base mainnet and Base Sepolia testnet
   - Real-time balance checking and transaction monitoring

3. **Payment Gate Component** (`components/payment/payment-gate.tsx`)
   - Wraps content that requires payment
   - Checks user access automatically
   - Shows payment UI until paid, then reveals content
   - Perfect for paywalled features

4. **API Routes**
   - `/api/payments/402/verify` - Verify payment proofs
   - `/api/payments/402/requirements` - Get payment requirements
   - `/api/payments/402/check-access` - Check user access to resources

5. **Payment Page** (`app/payment/base/page.tsx`)
   - Demo/showcase page for Base payments
   - Supports all payment tiers
   - Beautiful UI with service selection

## Features

### ✨ Key Benefits

- **Lightning Fast**: ~2 second transaction confirmations on Base L2
- **Ultra Low Fees**: <$0.01 per transaction
- **Secure**: Secured by Base blockchain (Coinbase's L2)
- **Stable**: Support for USDC stablecoin + ETH
- **HTTP 402**: Standard payment-required protocol implementation

### 💳 Supported Currencies

- **USDC** (USD Coin) - Recommended for stable pricing
- **ETH** (Ethereum) - Native currency support

### 🔐 Payment Tiers

Healthcare services:
- Virtual Consultation: $75 USDC
- In-Person Consultation: $150 USDC
- Specialist Consultation: $250 USDC

Premium features:
- Premium Month: $19.99 USDC
- Premium Year: $199 USDC

AI & Records:
- Medical Records Access: $10 USDC
- AI Diagnosis: $25 USDC
- AI Second Opinion: $50 USDC

## Usage Examples

### 1. Direct Payment Component

```tsx
import { BaseCDSPayment } from '@/components/payment/base-cds-payment'
import { PAYMENT_TIERS } from '@/lib/http-402-service'

function MyPaymentPage() {
  const handleSuccess = async (proof) => {
    // Verify payment
    const response = await fetch('/api/payments/402/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proof,
        requirement: PAYMENT_TIERS.VIRTUAL_CONSULTATION,
      }),
    })
    
    if (response.ok) {
      // Grant access
      router.push('/appointment')
    }
  }

  return (
    <BaseCDSPayment
      requirement={PAYMENT_TIERS.VIRTUAL_CONSULTATION}
      onSuccess={handleSuccess}
      onError={(err) => console.error(err)}
    />
  )
}
```

### 2. Payment Gate (Paywall)

```tsx
import { PaymentGate } from '@/components/payment/payment-gate'

function PremiumFeature() {
  return (
    <PaymentGate
      resourceType="PREMIUM_MONTH"
      title="Premium Features"
      description="Unlock unlimited AI insights and priority booking"
    >
      {/* Your premium content here */}
      <PremiumDashboard />
    </PaymentGate>
  )
}
```

### 3. API Route with Payment Gate

```ts
import { requirePayment, PAYMENT_TIERS } from '@/lib/http-402-service'

export async function GET(request: NextRequest) {
  // Check payment requirement
  const paymentCheck = await requirePayment(
    PAYMENT_TIERS.AI_DIAGNOSIS
  )(request)
  
  if (paymentCheck) {
    return paymentCheck // Returns 402 response
  }
  
  // User has paid, proceed with request
  return NextResponse.json({
    diagnosis: await generateAIDiagnosis(),
  })
}
```

### 4. Custom Payment Requirement

```tsx
import { BaseCDSPayment } from '@/components/payment/base-cds-payment'

function CustomPayment() {
  const customRequirement = {
    amount: 99.99,
    currency: 'USDC',
    resource: 'custom-service',
    description: 'Custom Healthcare Service',
    metadata: { serviceType: 'custom' },
  }

  return (
    <BaseCDSPayment
      requirement={customRequirement}
      onSuccess={(proof) => console.log('Paid!', proof)}
    />
  )
}
```

## Configuration

### Environment Variables

```bash
# Base Network (use 'production' for mainnet, 'development' for testnet)
NODE_ENV=development

# Coinbase CDP API Keys
CDP_API_KEY_NAME=your_api_key_name
CDP_API_KEY_SECRET=your_api_key_secret

# Payment Recipient Address (your wallet)
NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS=0x1234...5678

# Coinbase Commerce (optional)
NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY=your_commerce_key
COINBASE_COMMERCE_WEBHOOK_SECRET=your_webhook_secret
```

### Network Configuration

```ts
// lib/coinbase-config.ts
export const baseChain = process.env.NODE_ENV === 'production' 
  ? base        // Base Mainnet
  : baseSepolia // Base Sepolia Testnet

export const paymentConfig = {
  usdcAddress: {
    base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    'base-sepolia': '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  },
  recipientAddress: process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS,
  supportedTokens: [
    { symbol: 'USDC', decimals: 6, /* ... */ },
    { symbol: 'ETH', decimals: 18, /* ... */ },
  ],
}
```

## Payment Flow

1. **User Requests Resource**
   - User clicks to access premium feature/content
   - System checks if user has paid (`/api/payments/402/check-access`)

2. **Payment Required (402)**
   - If not paid, show payment UI
   - User selects currency (USDC or ETH)
   - User connects Coinbase Wallet

3. **Execute Payment**
   - Component creates transaction on Base
   - User approves in wallet
   - Transaction confirmed in ~2 seconds

4. **Verify Payment**
   - Frontend sends payment proof to `/api/payments/402/verify`
   - Backend verifies transaction on-chain
   - Payment recorded in database

5. **Grant Access**
   - User gets immediate access to resource
   - Access persists for subscription period

## HTTP 402 Protocol

### Response Format

When payment is required:

```http
HTTP/1.1 402 Payment Required
Accept-Payment: USDC,ETH
Payment-Required: true
Payment-Address: 0x1234...5678
Content-Type: application/json

{
  "error": "Payment Required",
  "message": "This resource requires payment of 75 USDC",
  "payment": {
    "amount": 75,
    "currency": "USDC",
    "recipient": "0x1234...5678",
    "tokenAddress": "0x833589...",
    "network": "base-sepolia",
    "description": "Virtual healthcare consultation",
    "resource": "virtual-consultation"
  }
}
```

### Payment Proof Format

After payment, client sends proof:

```json
{
  "transactionHash": "0xabcd...",
  "from": "0x5678...",
  "to": "0x1234...",
  "amount": "75",
  "currency": "USDC",
  "network": "base-sepolia",
  "timestamp": 1709000000000
}
```

## Security

### Payment Verification

1. **Transaction Hash Validation**: Verify hash format and length
2. **Recipient Verification**: Ensure payment went to correct address
3. **Amount Verification**: Check amount matches requirement (0.1% tolerance)
4. **Currency Verification**: Ensure correct currency used
5. **On-Chain Verification**: Verify transaction exists and is confirmed
6. **Timestamp Verification**: Ensure payment is recent (<24 hours)

### Best Practices

- Never trust client-side payment claims without verification
- Always verify transactions on-chain
- Store payment records in database
- Implement rate limiting on payment endpoints
- Use HTTPS for all API calls
- Validate wallet signatures where applicable

## Testing

### Testnet Testing (Base Sepolia)

1. Get testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
2. Swap for testnet USDC on [Uniswap](https://app.uniswap.org)
3. Connect wallet to Base Sepolia network
4. Test payments at `/payment/base`

### Local Development

```bash
# Set environment to development
NODE_ENV=development

# Set recipient address to your test wallet
NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS=0x_your_test_wallet

# Run dev server
npm run dev
```

Visit `http://localhost:3000/payment/base` to test.

## Monitoring

### Transaction Monitoring

View transactions on:
- **Mainnet**: https://basescan.org
- **Testnet**: https://sepolia.basescan.org

### Payment Analytics

Track payment metrics:
- Total volume per currency
- Average transaction time
- Success/failure rates
- Popular payment tiers
- User conversion rates

## Roadmap

### Phase 1 (Current)
- ✅ Base blockchain integration
- ✅ USDC/ETH support
- ✅ HTTP 402 protocol
- ✅ Payment gate component
- ✅ API routes

### Phase 2 (Planned)
- 🔲 Database integration for payment records
- 🔲 Subscription management
- 🔲 Refund system
- 🔲 Payment history dashboard
- 🔲 Multi-recipient splits

### Phase 3 (Future)
- 🔲 Support for more tokens (DAI, USDT)
- 🔲 Recurring payments
- 🔲 Payment links/invoices
- 🔲 Mobile app integration
- 🔲 Advanced analytics

## Resources

- [Base Documentation](https://docs.base.org)
- [Coinbase Developer Platform](https://docs.cloud.coinbase.com)
- [Wagmi Documentation](https://wagmi.sh)
- [Viem Documentation](https://viem.sh)
- [HTTP 402 Specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/402)

## Support

For issues or questions:
1. Check the [troubleshooting guide](#troubleshooting)
2. Review Base documentation
3. Contact dev team

## Troubleshooting

### Common Issues

**Payment not confirming**
- Check wallet has sufficient balance
- Verify correct network (Base/Base Sepolia)
- Ensure gas fees available
- Check transaction on block explorer

**"Invalid payment proof" error**
- Verify transaction completed successfully
- Check recipient address matches
- Ensure amount is sufficient
- Verify using correct network

**Wallet won't connect**
- Install Coinbase Wallet extension
- Switch to Base network
- Clear browser cache
- Try different browser

**Balance showing as $0**
- Wait a few seconds for balance to load
- Refresh the page
- Verify wallet connected to correct network
- Check token contract address

## License

MIT License - See LICENSE file for details.


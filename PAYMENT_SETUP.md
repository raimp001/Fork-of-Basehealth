# Payment Setup Guide for BaseHealth

This guide will help you set up all payment methods for your healthcare platform.

## Quick Start

Your app supports three payment methods:
1. **Credit Cards** (Stripe) - Visa, Mastercard, Apple Pay, Google Pay
2. **Base Blockchain** (Coinbase CDP) - USDC, ETH on Base
3. **Solana Blockchain** - SOL, USDC on Solana

---

## 1. Base Blockchain Setup (Coinbase CDP) ✅ Configured

Your Coinbase CDP API keys are already configured. Now you need a wallet to receive payments.

### Option A: Create Wallet via API (Recommended)

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit this URL in your browser:
   ```
   http://localhost:3000/api/admin/setup-wallet
   ```

3. Copy the wallet address from the response and add to `.env.local`:
   ```
   NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS="0x..."
   ```

4. **IMPORTANT**: Save the wallet backup data securely!

### Option B: Use Existing Wallet

If you already have a Base/Ethereum wallet (Coinbase Wallet, MetaMask, etc.):

1. Copy your wallet address
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS="your-wallet-address"
   ```

### Get Test Funds (Testnet)

For development, get free test ETH from these working faucets:

| Faucet | Amount | Requirements |
|--------|--------|--------------|
| [LearnWeb3](https://learnweb3.io/faucets/base_sepolia/) | 0.01 ETH/day | GitHub login |
| [Alchemy](https://www.alchemy.com/faucets/base-sepolia) | 0.1 ETH | Free account |
| [Chainlink](https://faucets.chain.link/base-sepolia) | 0.1 ETH | Connect wallet |
| [QuickNode](https://faucet.quicknode.com/base/sepolia) | 0.1 ETH | Free account |

---

## 2. Solana Blockchain Setup

### Step 1: Create a Solana Wallet

**Option A: Phantom Wallet (Recommended)**
1. Install [Phantom](https://phantom.app/) browser extension
2. Create a new wallet
3. Copy your wallet address (looks like: `7xKX...abc`)

**Option B: Solflare Wallet**
1. Install [Solflare](https://solflare.com/)
2. Create a new wallet
3. Copy your wallet address

### Step 2: Add to Environment

Add to `.env.local`:
```bash
NEXT_PUBLIC_SOLANA_NETWORK="devnet"  # Use "mainnet-beta" for production
NEXT_PUBLIC_SOLANA_RECIPIENT_WALLET="your-solana-wallet-address"
```

### Get Test SOL (Devnet)

For development, get free test SOL:
```bash
# Using Solana CLI
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet

# Or visit: https://faucet.solana.com/
```

---

## 3. Stripe Setup (Credit Cards)

### Step 1: Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Sign up for a free account
3. Complete business verification (for production)

### Step 2: Get API Keys

1. Go to [Developers > API Keys](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)
3. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)

### Step 3: Set Up Webhooks

1. Go to [Developers > Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/payments/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
5. Copy the **Signing secret** (starts with `whsec_`)

### Step 4: Add to Environment

Add to `.env.local`:
```bash
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## Complete .env.local Example

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-secret"

# ============================================
# PAYMENT CONFIGURATION
# ============================================

# Coinbase CDP (Base Blockchain)
CDP_API_KEY_NAME="your-api-key-name"
CDP_API_KEY_SECRET="your-api-key-secret"
NEXT_PUBLIC_COINBASE_CDP_API_KEY="your-api-key-name"
NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS="0x..."  # Your Base wallet

# Solana
NEXT_PUBLIC_SOLANA_NETWORK="devnet"
NEXT_PUBLIC_SOLANA_RECIPIENT_WALLET="..."  # Your Solana wallet

# Stripe (Credit Cards)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Optional: Coinbase Commerce (hosted checkout)
NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY="..."
COINBASE_COMMERCE_WEBHOOK_SECRET="..."
```

---

## Testing Payments

### Test Credit Cards (Stripe)
Use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Expiry: Any future date | CVC: Any 3 digits

### Test Base Payments
1. Connect Coinbase Wallet or MetaMask
2. Switch to Base Sepolia testnet
3. Use test ETH/USDC from faucet

### Test Solana Payments
1. Connect Phantom wallet
2. Switch to Devnet
3. Use test SOL from faucet

---

## Production Checklist

Before going live:

- [ ] Switch Stripe to live keys (`sk_live_`, `pk_live_`)
- [ ] Switch Solana to `mainnet-beta`
- [ ] Switch Base to mainnet (update recipient address if needed)
- [ ] Update webhook URLs to production domain
- [ ] Test all payment flows end-to-end
- [ ] Set up monitoring and alerts
- [ ] Configure proper error handling
- [x] Implement refund handling

---

## Support

- **Stripe**: [Stripe Documentation](https://stripe.com/docs)
- **Coinbase CDP**: [CDP Documentation](https://docs.cdp.coinbase.com/)
- **Solana**: [Solana Documentation](https://docs.solana.com/)

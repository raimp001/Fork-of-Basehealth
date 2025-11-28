# 🚀 How to Access Base Chain & Coinbase CDK Features

## 🌐 Live Website URLs

Your website is live at: **https://www.basehealth.xyz**

## 📍 Direct Access Links

### 1. **Base Blockchain Payments**
**URL**: `https://www.basehealth.xyz/payment/base`

**What you can do here:**
- Connect your Coinbase Wallet or MetaMask
- Make payments with USDC or ETH
- Test different payment tiers:
  - Virtual Consultation ($75 USDC)
  - In-Person Consultation ($150 USDC)
  - Specialist Consultation ($250 USDC)
  - Premium subscriptions
  - AI Diagnosis services
  - Medical Records access

**How to access:**
1. Go to www.basehealth.xyz
2. Click on your profile/user menu (top right)
3. Select "Base Payments" (has a "New" badge)
4. Or directly visit: `/payment/base`

---

### 2. **OnchainKit Wallet Features**
**URL**: `https://www.basehealth.xyz/wallet/onchain`

**What you can do here:**
- Connect wallet using Coinbase OnchainKit
- View wallet address details
- Check token holdings (USDC, ETH)
- Perform wallet actions
- Execute transactions

**How to access:**
1. Go to www.basehealth.xyz
2. Navigate to "Wallet" in the user menu
3. Or directly visit: `/wallet/onchain`

---

### 3. **General Wallet Page**
**URL**: `https://www.basehealth.xyz/wallet`

**What you can do here:**
- View wallet overview
- Connect Web3 wallets
- Manage crypto payments
- View transaction history

---

## 🔧 Testing Setup

### For Testnet Testing (Recommended for Testing)

1. **Switch to Base Sepolia Testnet:**
   - The site automatically uses Base Sepolia in development
   - For production, set `NODE_ENV=development` in Vercel environment variables

2. **Get Testnet Tokens:**
   - **Base Sepolia ETH**: Get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
   - **Base Sepolia USDC**: Get test USDC from Base Sepolia testnet

3. **Connect Your Wallet:**
   - Install [Coinbase Wallet](https://www.coinbase.com/wallet) browser extension
   - Or use MetaMask with Base Sepolia network added
   - Make sure you're on Base Sepolia testnet in your wallet

### For Mainnet Testing (Real Money)

1. **Switch to Base Mainnet:**
   - Set `NODE_ENV=production` in Vercel
   - Or set `NEXT_PUBLIC_NETWORK=base`

2. **Fund Your Wallet:**
   - Send ETH or USDC to your wallet on Base Mainnet
   - Use Coinbase or another exchange to bridge to Base

---

## 📱 Step-by-Step Testing Guide

### Test 1: Connect Wallet

1. Visit: `https://www.basehealth.xyz/payment/base`
2. Click "Connect Wallet" button
3. Select Coinbase Wallet or MetaMask
4. Approve the connection
5. ✅ You should see your wallet address displayed

### Test 2: Make a Test Payment

1. On `/payment/base` page
2. Select a service (e.g., "Virtual Consult - $75 USDC")
3. Ensure you have USDC in your wallet (testnet for testing)
4. Click "Pay with USDC"
5. Approve the transaction in your wallet
6. ✅ Transaction should confirm in ~2 seconds
7. ✅ You'll see a success message

### Test 3: View Wallet Details

1. Visit: `https://www.basehealth.xyz/wallet/onchain`
2. Connect your wallet
3. ✅ You should see:
   - Your wallet address
   - Token balances (USDC, ETH)
   - Transaction history
   - Wallet actions

---

## 🎯 Navigation Paths

### From Homepage:
1. Click user menu (top right) → "Base Payments"
2. Or: User menu → "Wallet" → "OnchainKit Wallet"

### From Navigation:
- Desktop: User menu → "Base Payments" (with "New" badge)
- Mobile: Bottom navigation → User icon → "Base Payments"

---

## 🔍 What to Look For

### ✅ Success Indicators:

1. **Wallet Connection:**
   - Wallet address displayed
   - Network shows "Base" or "Base Sepolia"
   - Balance visible

2. **Payment Success:**
   - Transaction hash displayed
   - Link to BaseScan explorer
   - Success toast notification
   - Access granted message

3. **OnchainKit Features:**
   - Wallet components render correctly
   - Token holdings show balances
   - Transaction actions work

---

## 🐛 Troubleshooting

### Wallet Won't Connect:
- Make sure Coinbase Wallet extension is installed
- Check browser permissions
- Try refreshing the page
- Clear browser cache

### Wrong Network:
- Switch your wallet to Base Sepolia (testnet) or Base (mainnet)
- Check Vercel environment variables

### Payment Fails:
- Ensure you have sufficient balance
- Check network matches (testnet vs mainnet)
- Verify USDC contract address is correct for your network

### Can't See Features:
- Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
- Check browser console for errors
- Verify deployment completed successfully

---

## 📊 Environment Variables (Optional)

To enhance functionality, add these to Vercel:

```bash
# For Coinbase CDP API (optional)
NEXT_PUBLIC_COINBASE_CDP_API_KEY=your_key

# For custom RPC (optional)
NEXT_PUBLIC_BASE_RPC_URL=your_rpc_url

# For payment recipient (optional)
NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS=0x_your_wallet

# Network selection
NODE_ENV=production  # or development
NEXT_PUBLIC_NETWORK=base  # or base-sepolia
```

---

## 🎉 Quick Test Checklist

- [ ] Visit `/payment/base` - Page loads
- [ ] Click "Connect Wallet" - Wallet connects
- [ ] Select a payment tier - UI updates
- [ ] View wallet balance - Balance displays
- [ ] Visit `/wallet/onchain` - OnchainKit features work
- [ ] Check network - Shows Base/Base Sepolia
- [ ] Make test payment - Transaction succeeds

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify wallet is on correct network
3. Check Vercel deployment logs
4. Review `BASE_CHAIN_SUPPORT.md` for configuration details

---

**✅ All Base Chain and Coinbase CDK features are live and ready to test!**


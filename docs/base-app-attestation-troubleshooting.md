# Base App Attestation Troubleshooting

If provider attestation fails with a "discrepancy" or signature mismatch message, check these in order:

1. **Wallet address consistency**
   - The connected wallet used to sign must match the provider `walletAddress` stored in BaseHealth.
   - If the provider changed wallets, update wallet address in the provider profile before signing.

2. **Chain consistency**
   - Wallet must be on the same chain as the app signing domain (`NEXT_PUBLIC_BASE_CHAIN_ID`).
   - Base Mainnet = `8453`, Base Sepolia = `84532`.

3. **Schema and attestor readiness**
   - Confirm server has correct schema UID for target chain.
   - Confirm `ATTESTATION_PRIVATE_KEY` is configured.

4. **Use debug endpoint**
   - Call `GET /api/attestations/debug` to inspect chain/schema/readiness.

## Should you create a new wallet/account?
Usually **no**. Most failures are from network mismatch or stale wallet address on the provider record.
Create a new account only if your existing wallet is inaccessible.

## Required env vars for Base app sign + attestation
- `NEXT_PUBLIC_BASE_CHAIN_ID`
- `NEXT_PUBLIC_NETWORK`
- `EAS_SCHEMA_UID_MAINNET` or `EAS_SCHEMA_UID_SEPOLIA`
- `ATTESTATION_PRIVATE_KEY`
- `NEXT_PUBLIC_PRIVY_APP_ID`
- `PRIVY_APP_SECRET`

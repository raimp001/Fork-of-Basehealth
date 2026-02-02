# Authentication System

BaseHealth uses **Privy** for wallet-as-login authentication. This enables users to login with their crypto wallet (or email/SMS as fallback) and have their identity mapped to an application user.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PrivyProvider (app/providers.tsx)                              │
│    └── Wraps entire app                                         │
│    └── Provides usePrivy() hook                                 │
│                                                                  │
│  PrivyLoginButton (components/auth/privy-login-button.tsx)      │
│    └── Click = opens Privy login modal                          │
│    └── Shows wallet address when connected                      │
│                                                                  │
│  RequireAuth (components/auth/require-auth.tsx)                 │
│    └── Wrap protected pages/components                          │
│    └── Auto-triggers login if not authenticated                 │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                          SERVER                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  requirePrivyAuth (lib/privy-auth.ts)                           │
│    └── Verify auth token on API routes                          │
│    └── Returns userId, walletAddress                            │
│                                                                  │
│  /api/auth/privy/ensure-user                                    │
│    └── Creates/updates user record on first login               │
│    └── Maps Privy identity to application user                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Environment Variables

```env
# Required
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id

# Required for server-side auth
PRIVY_APP_SECRET=your-privy-app-secret

# Optional
NEXT_PUBLIC_PRIVY_ENV=development
```

## Usage

### Client-side: Login Button

```tsx
import { PrivyLoginButton } from '@/components/auth/privy-login-button'

function Header() {
  return (
    <nav>
      <PrivyLoginButton />
    </nav>
  )
}
```

### Client-side: Protect a Route

```tsx
import { RequireAuth } from '@/components/auth/require-auth'

export default function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsContent />
    </RequireAuth>
  )
}
```

### Client-side: Check Auth State

```tsx
import { usePrivyAuth } from '@/components/auth/privy-login-button'

function MyComponent() {
  const { authenticated, walletAddress, login, logout } = usePrivyAuth()
  
  if (!authenticated) {
    return <button onClick={login}>Login</button>
  }
  
  return <div>Wallet: {walletAddress}</div>
}
```

### Server-side: Protect API Route

```tsx
import { requirePrivyAuth } from '@/lib/privy-auth'

export async function POST(request: NextRequest) {
  const auth = await requirePrivyAuth(request)
  
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }
  
  // Use auth.userId, auth.walletAddress
  const userId = auth.userId
  
  // ... rest of handler
}
```

## Identity Model

| Field | Description |
|-------|-------------|
| `privyUserId` | Stable Privy user ID (primary identity) |
| `walletAddress` | User's primary wallet address (0x...) |
| `email` | Email address (if provided) |

The `privyUserId` is the canonical identity. Wallet addresses may change if user links new wallets.

## Regression Checklist

### New User Flow
- [ ] User clicks "Login"
- [ ] Privy modal opens
- [ ] User connects wallet (or uses email/SMS)
- [ ] User is logged in
- [ ] User can access Settings page
- [ ] User record created in database

### Returning User Flow
- [ ] User clicks "Login"
- [ ] Privy recognizes returning user
- [ ] One-click login (wallet already connected)
- [ ] User can access protected routes

### Disconnect/Logout Flow
- [ ] User clicks logout from dropdown
- [ ] User is logged out
- [ ] Protected routes redirect to login
- [ ] No session persists

### Protected Route Flow
- [ ] Unauthenticated user visits /settings
- [ ] Login modal appears automatically
- [ ] After login, user sees settings page

## Supported Login Methods

1. **Wallet** (primary)
   - Coinbase Wallet
   - MetaMask
   - WalletConnect
   - Embedded wallet (Privy-managed)

2. **Email** (fallback)
   - Magic link login

3. **SMS** (fallback)
   - Phone verification

## Chain Configuration

- **Mainnet**: Base (chain ID 8453)
- **Testnet**: Base Sepolia (chain ID 84532)

Toggle via `NEXT_PUBLIC_USE_MAINNET=true`.

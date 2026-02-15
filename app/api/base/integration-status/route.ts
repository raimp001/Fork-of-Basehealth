import { NextResponse } from "next/server"
import { ACTIVE_CHAIN, PAYMENT_CONFIG } from "@/lib/network-config"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Check = {
  id: string
  label: string
  env?: string
  required: boolean
  passed: boolean
  help: string
}

type Section = {
  id: string
  title: string
  checks: Check[]
}

function sectionReady(section: Section): boolean {
  return section.checks.every((check) => (check.required ? check.passed : true))
}

export async function GET() {
  const chatPaywallEnabled = (process.env.BASEHEALTH_CHAT_PAYWALL || "false").toLowerCase() === "true"

  const aiProvider =
    process.env.OPENCLAW_API_KEY || process.env.OPENCLAW_GATEWAY_TOKEN
      ? "openclaw"
      : process.env.OPENAI_API_KEY
        ? "openai"
        : process.env.GROQ_API_KEY
          ? "groq"
          : "none"

  const sections: Section[] = [
    {
      id: "sign-in",
      title: "Wallet Sign-In (Base Smart Wallet)",
      checks: [
        {
          id: "nextauth-secret",
          label: "NextAuth secret set",
          env: "NEXTAUTH_SECRET",
          required: true,
          passed: Boolean(process.env.NEXTAUTH_SECRET),
          help: "Required for secure session signing.",
        },
        {
          id: "database-url",
          label: "Database URL set",
          env: "DATABASE_URL",
          required: true,
          passed: Boolean(process.env.DATABASE_URL),
          help: "Required to persist users and wallet recognition.",
        },
        {
          id: "app-url",
          label: "App URL configured (recommended)",
          env: "NEXT_PUBLIC_APP_URL",
          required: false,
          passed: Boolean(process.env.NEXT_PUBLIC_APP_URL),
          help: "Recommended for correct metadata, receipts, and deep-links (e.g., Base mini app).",
        },
      ],
    },
    {
      id: "miniapp",
      title: "Base Mini App Ownership (farcaster.json)",
      checks: [
        {
          id: "miniapp-header",
          label: "Account association header set",
          env: "MINIAPP_HEADER / FARCASTER_HEADER",
          required: true,
          passed: Boolean(process.env.MINIAPP_HEADER || process.env.FARCASTER_HEADER),
          help: "Required for Base mini app ownership verification (served from /.well-known/farcaster.json).",
        },
        {
          id: "miniapp-payload",
          label: "Account association payload set",
          env: "MINIAPP_PAYLOAD / FARCASTER_PAYLOAD",
          required: true,
          passed: Boolean(process.env.MINIAPP_PAYLOAD || process.env.FARCASTER_PAYLOAD),
          help: "Required for Base mini app ownership verification (served from /.well-known/farcaster.json).",
        },
        {
          id: "miniapp-signature",
          label: "Account association signature set",
          env: "MINIAPP_SIGNATURE / FARCASTER_SIGNATURE",
          required: true,
          passed: Boolean(process.env.MINIAPP_SIGNATURE || process.env.FARCASTER_SIGNATURE),
          help: "Required for Base mini app ownership verification (served from /.well-known/farcaster.json).",
        },
        {
          id: "miniapp-app-url",
          label: "App URL configured (recommended)",
          env: "NEXT_PUBLIC_APP_URL / NEXT_PUBLIC_URL",
          required: false,
          passed: Boolean(process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL),
          help: "Recommended so farcaster.json homeUrl/iconUrl and open-graph metadata match your canonical domain.",
        },
      ],
    },
    {
      id: "assistant",
      title: "Assistant (AI)",
      checks: [
        {
          id: "ai-provider",
          label: "AI provider configured",
          required: true,
          passed: Boolean(
            process.env.OPENCLAW_API_KEY ||
              process.env.OPENCLAW_GATEWAY_TOKEN ||
              process.env.OPENAI_API_KEY ||
              process.env.GROQ_API_KEY,
          ),
          help: "Required for /chat. Set OPENCLAW_API_KEY (recommended) or OPENCLAW_GATEWAY_TOKEN or OPENAI_API_KEY or GROQ_API_KEY in your deployment environment, then redeploy.",
        },
        {
          id: "openclaw",
          label: "OpenClaw key configured (recommended)",
          env: "OPENCLAW_API_KEY",
          required: false,
          passed: Boolean(process.env.OPENCLAW_API_KEY || process.env.OPENCLAW_GATEWAY_TOKEN),
          help: "Enables multi-agent routing with provider-managed models (supports OPENCLAW_API_KEY or OPENCLAW_GATEWAY_TOKEN).",
        },
        {
          id: "openai",
          label: "OpenAI key configured (optional fallback)",
          env: "OPENAI_API_KEY",
          required: false,
          passed: Boolean(process.env.OPENAI_API_KEY),
          help: "Fallback provider if OpenClaw is not configured.",
        },
      ],
    },
    {
      id: "account-management",
      title: "Account Management",
      checks: [
        {
          id: "wallet-signin",
          label: "Wallet sign-in routes available",
          required: true,
          passed: true,
          help: "Uses Base Smart Wallet / Coinbase Smart Wallet message signing (EOA + EIP-1271 contract wallets).",
        },
      ],
    },
    {
      id: "billing",
      title: "Billing & Receipts",
      checks: [
        {
          id: "resend-key",
          label: "Resend API key configured",
          env: "RESEND_API_KEY",
          required: false,
          passed: Boolean(process.env.RESEND_API_KEY),
          help: "Needed for email delivery of receipts and refund notifications.",
        },
        {
          id: "from-email",
          label: "From email configured",
          env: "FROM_EMAIL",
          required: false,
          passed: Boolean(process.env.FROM_EMAIL),
          help: "Recommended sender identity for billing communications.",
        },
      ],
    },
    {
      id: "payments",
      title: "Base Payments",
      checks: [
        {
          id: "recipient",
          label: "Base settlement recipient wallet configured",
          env: "NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS",
          required: true,
          passed: /^0x[a-fA-F0-9]{40}$/.test((PAYMENT_CONFIG.recipientAddress || "").trim()),
          help: "The wallet that receives USDC/ETH settlement. Set NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS to override.",
        },
        {
          id: "walletconnect",
          label: "WalletConnect project ID configured (optional)",
          env: "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID",
          required: false,
          passed: Boolean(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID),
          help: "Optional. Coinbase Smart Wallet works without it; WalletConnect adds broader wallet compatibility.",
        },
      ],
    },
    {
      id: "privy",
      title: "Privy (Optional)",
      checks: [
        {
          id: "privy-app-id",
          label: "Privy App ID configured (optional)",
          env: "NEXT_PUBLIC_PRIVY_APP_ID",
          required: false,
          passed: Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID),
          help: "Enables Privy-powered UX (e.g., x402 helper components) if you want it.",
        },
        {
          id: "privy-secret",
          label: "Privy App Secret configured (optional)",
          env: "PRIVY_APP_SECRET",
          required: false,
          passed: Boolean(process.env.PRIVY_APP_SECRET),
          help: "Only needed if you use Privy server-side token verification routes.",
        },
      ],
    },
    {
      id: "refunds",
      title: "Refund Operations",
      checks: [
        {
          id: "admin-email",
          label: "Admin notification email configured",
          env: "ADMIN_EMAIL",
          required: false,
          passed: Boolean(process.env.ADMIN_EMAIL),
          help: "Recommended to monitor refunds and booking exceptions.",
        },
        {
          id: "attestation-key",
          label: "Attestation private key configured",
          env: "ATTESTATION_PRIVATE_KEY",
          required: false,
          passed: Boolean(process.env.ATTESTATION_PRIVATE_KEY),
          help: "Optional for advanced onchain audit trails and attestations.",
        },
      ],
    },
  ]

  const missingRequired = sections.flatMap((section) =>
    section.checks
      .filter((check) => check.required && !check.passed)
      .map((check) => ({
        sectionId: section.id,
        sectionTitle: section.title,
        checkId: check.id,
        label: check.label,
        env: check.env,
        help: check.help,
      })),
  )

  const readiness = sections.map((section) => ({
    id: section.id,
    title: section.title,
    ready: sectionReady(section),
    checks: section.checks,
  }))

  const response = NextResponse.json({
    success: true,
    generatedAt: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV || null,
      vercelEnv: process.env.VERCEL_ENV || null,
      vercelRegion: process.env.VERCEL_REGION || null,
      vercelUrl: process.env.VERCEL_URL || null,
      gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
      gitCommitRef: process.env.VERCEL_GIT_COMMIT_REF || null,
    },
    features: {
      chatPaywallEnabled,
    },
    network: {
      name: ACTIVE_CHAIN.name,
      chainId: ACTIVE_CHAIN.id,
    },
    overallReady: missingRequired.length === 0,
    aiProvider,
    sections: readiness,
    missingRequired,
  })
  response.headers.set("Cache-Control", "no-store, max-age=0")
  return response
}

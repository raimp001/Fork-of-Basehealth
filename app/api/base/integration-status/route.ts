import { NextResponse } from "next/server"
import { ACTIVE_CHAIN } from "@/lib/network-config"

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
      id: "assistant",
      title: "Assistant (AI)",
      checks: [
        {
          id: "ai-provider",
          label: "AI provider configured",
          required: true,
          passed: Boolean(process.env.OPENCLAW_API_KEY || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY),
          help: "Required for /chat. Set OPENCLAW_API_KEY (recommended) or OPENAI_API_KEY or GROQ_API_KEY in your deployment environment, then redeploy.",
        },
        {
          id: "openclaw",
          label: "OpenClaw key configured (recommended)",
          env: "OPENCLAW_API_KEY",
          required: false,
          passed: Boolean(process.env.OPENCLAW_API_KEY),
          help: "Enables multi-agent routing with provider-managed models.",
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
          passed: Boolean(process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS),
          help: "The wallet that receives USDC/ETH settlement.",
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

  return NextResponse.json({
    success: true,
    generatedAt: new Date().toISOString(),
    network: {
      name: ACTIVE_CHAIN.name,
      chainId: ACTIVE_CHAIN.id,
    },
    overallReady: missingRequired.length === 0,
    sections: readiness,
    missingRequired,
  })
}

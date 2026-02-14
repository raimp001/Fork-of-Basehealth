import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { verifyPassword } from "@/lib/user-store"
import { prisma } from "@/lib/prisma"
import { ACTIVE_CHAIN } from "@/lib/network-config"
import { verifyWalletMessageSignature } from "@/lib/wallet-signin"
import {
  WALLET_NONCE_COOKIE_NAME,
  WALLET_SIGNIN_MESSAGE_VERSION,
  getCookieValue,
  isRecentIsoDate,
  parseWalletSignInMessage,
} from "@/lib/wallet-signin-message"

function getHeader(req: any, name: string): string | null {
  const headers = req?.headers
  if (!headers) return null
  if (typeof headers.get === "function") {
    return headers.get(name)
  }
  const value = headers[name] ?? headers[name.toLowerCase()]
  if (Array.isArray(value)) return value[0] ?? null
  return typeof value === "string" ? value : null
}

const roleToEnum = (role?: string | null) => {
  const value = (role || "").toLowerCase()
  if (value === "provider") return "PROVIDER"
  if (value === "caregiver") return "CAREGIVER"
  if (value === "admin") return "ADMIN"
  return "PATIENT"
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: "wallet",
      name: "Coinbase Smart Wallet",
      credentials: {
        address: { label: "Address", type: "text" },
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials, req) {
        const address = credentials?.address?.trim()
        const message = credentials?.message || ""
        const signature = credentials?.signature || ""

        if (!address || !message || !signature) return null

        const parsed = parseWalletSignInMessage(message)
        if (!parsed) return null

        if ((parsed.version ?? WALLET_SIGNIN_MESSAGE_VERSION) !== WALLET_SIGNIN_MESSAGE_VERSION) {
          return null
        }

        // Nonce check (cookie is HttpOnly and set by /api/auth/wallet/nonce)
        const cookieHeader = getHeader(req, "cookie")
        const expectedNonce = getCookieValue(cookieHeader, WALLET_NONCE_COOKIE_NAME)
        if (!expectedNonce || parsed.nonce !== expectedNonce) return null

        // Domain check (matches request host, including dev port)
        const host = getHeader(req, "host")
        if (host && parsed.domain !== host) return null

        // Chain check
        if (parsed.chainId !== ACTIVE_CHAIN.id) return null

        // Freshness check
        if (!isRecentIsoDate(parsed.issuedAt, 10 * 60 * 1000)) return null

        // Address check
        if (parsed.address.toLowerCase() !== address.toLowerCase()) return null

        const verification = await verifyWalletMessageSignature({
          address: parsed.address,
          message,
          signature,
        })

        if (!verification.valid) return null

        const normalizedWallet = parsed.address.toLowerCase()

        const user = await prisma.user.upsert({
          where: { walletAddress: normalizedWallet },
          update: { lastLoginAt: new Date() },
          create: {
            walletAddress: normalizedWallet,
            role: "PATIENT",
            lastLoginAt: new Date(),
          },
        })

        return {
          id: user.id,
          email: user.email || undefined,
          name: user.name || undefined,
          role: user.role,
          walletAddress: user.walletAddress,
          privyUserId: user.privyUserId || undefined,
        } as any
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Use shared user store for verification
        const user = await verifyPassword(credentials.email, credentials.password)
        
        if (!user) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: roleToEnum(user.role),
          image: user.image
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.walletAddress = (user as any).walletAddress
        token.privyUserId = (user as any).privyUserId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        ;(session.user as any).walletAddress = (token as any).walletAddress
        ;(session.user as any).privyUserId = (token as any).privyUserId
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  // Use environment variable only - no insecure fallback
  secret: process.env.NEXTAUTH_SECRET
})

export { handler as GET, handler as POST }

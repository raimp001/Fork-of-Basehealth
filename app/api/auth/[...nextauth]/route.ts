import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getToken } from "next-auth/jwt"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { ACTIVE_CHAIN } from "@/lib/network-config"
import { verifyWalletMessageSignature } from "@/lib/wallet-signin"
import { isAdminEmail } from "@/lib/admin-access"
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

const normalizeRoleForEmail = (role?: string | null, email?: string | null) => {
  const normalized = roleToEnum(role)
  if (isAdminEmail(email)) return "ADMIN"
  if (normalized === "ADMIN") return "PATIENT"
  return normalized
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

        let user = await prisma.user.findUnique({
          where: { walletAddress: normalizedWallet },
        })

        // If the browser already has an authenticated session (e.g., email/password login),
        // link this wallet to that same account so profile data stays attached to one user.
        if (!user) {
          const secret = process.env.NEXTAUTH_SECRET
          const existingToken = secret ? await getToken({ req: req as any, secret }) : null
          const existingUserId = typeof existingToken?.id === "string" ? existingToken.id : null

          if (existingUserId) {
            const existingUser = await prisma.user.findUnique({
              where: { id: existingUserId },
              select: { id: true, walletAddress: true },
            })

            if (existingUser && (!existingUser.walletAddress || existingUser.walletAddress === normalizedWallet)) {
              user = await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  walletAddress: normalizedWallet,
                  lastLoginAt: new Date(),
                },
              })
            }
          }
        }

        if (!user) {
          user = await prisma.user.create({
            data: {
              walletAddress: normalizedWallet,
              role: "PATIENT",
              lastLoginAt: new Date(),
            },
          })
        } else {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })
        }

        if (user.role === "PATIENT") {
          await prisma.patient.upsert({
            where: { userId: user.id },
            update: {},
            create: {
              userId: user.id,
              allergies: [],
              conditions: [],
              medications: [],
            },
          })
        }

        return {
          id: user.id,
          email: user.email || undefined,
          name: user.name || undefined,
          role: normalizeRoleForEmail(user.role, user.email),
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

        const normalizedEmail = credentials.email.trim().toLowerCase()
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            password: true,
            walletAddress: true,
            privyUserId: true,
          },
        })

        if (!user?.password) {
          return null
        }

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) {
          return null
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: normalizeRoleForEmail(user.role, user.email),
          walletAddress: user.walletAddress || undefined,
          privyUserId: user.privyUserId || undefined,
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
        token.email = (user as any).email ?? token.email
        token.name = (user as any).name ?? token.name
        token.id = user.id
        token.role = normalizeRoleForEmail((user as any).role, (user as any).email ?? (token.email as string | undefined))
        token.walletAddress = (user as any).walletAddress
        token.privyUserId = (user as any).privyUserId
      } else if (typeof token.id === "string" && token.id.trim()) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            email: true,
            name: true,
            role: true,
            walletAddress: true,
            privyUserId: true,
          },
        })

        if (dbUser) {
          token.email = dbUser.email ?? token.email
          token.name = dbUser.name ?? token.name
          token.role = normalizeRoleForEmail(dbUser.role, dbUser.email)
          token.walletAddress = dbUser.walletAddress
          token.privyUserId = dbUser.privyUserId
        } else {
          token.role = normalizeRoleForEmail(token.role as string | undefined, token.email as string | undefined)
        }
      } else {
        token.role = normalizeRoleForEmail(token.role as string | undefined, token.email as string | undefined)
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = (token.name as string | undefined) ?? session.user.name
        session.user.role = normalizeRoleForEmail(token.role as string | undefined, token.email as string | undefined)
        session.user.email = (token.email as string | undefined) ?? session.user.email
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

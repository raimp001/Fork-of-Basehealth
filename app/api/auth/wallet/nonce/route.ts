import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { cookies } from "next/headers"
import { WALLET_NONCE_COOKIE_NAME } from "@/lib/wallet-signin-message"

export async function GET() {
  const nonce = randomBytes(16).toString("hex")

  const cookieStore = await cookies()
  cookieStore.set(WALLET_NONCE_COOKIE_NAME, nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60, // 10 minutes
  })

  return NextResponse.json(
    { nonce, expiresInSeconds: 10 * 60 },
    { headers: { "Cache-Control": "no-store" } },
  )
}

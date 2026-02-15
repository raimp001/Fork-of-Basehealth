import { NextResponse } from "next/server"

type PriceResponse = {
  success: boolean
  symbol: "ETH"
  currency: "USD"
  price: number
  source: string
  updatedAt: string
}

let CACHE: { price: number; updatedAtMs: number } | null = null
const TTL_MS = 60_000

async function fetchEthUsdPrice(): Promise<number> {
  // Coinbase public spot price API (no key required).
  const res = await fetch("https://api.coinbase.com/v2/prices/ETH-USD/spot", {
    // Keep the cache short so tips don't get stale pricing.
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error(`Coinbase price fetch failed (${res.status})`)
  }

  const json: any = await res.json().catch(() => null)
  const raw = json?.data?.amount
  const price = typeof raw === "string" ? Number.parseFloat(raw) : Number.NaN
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Invalid Coinbase price response")
  }
  return price
}

export async function GET() {
  try {
    const now = Date.now()
    if (CACHE && now - CACHE.updatedAtMs < TTL_MS) {
      const payload: PriceResponse = {
        success: true,
        symbol: "ETH",
        currency: "USD",
        price: CACHE.price,
        source: "coinbase",
        updatedAt: new Date(CACHE.updatedAtMs).toISOString(),
      }
      return NextResponse.json(payload)
    }

    const price = await fetchEthUsdPrice()
    CACHE = { price, updatedAtMs: now }

    const payload: PriceResponse = {
      success: true,
      symbol: "ETH",
      currency: "USD",
      price,
      source: "coinbase",
      updatedAt: new Date(now).toISOString(),
    }
    return NextResponse.json(payload)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch ETH price",
      },
      { status: 500 },
    )
  }
}


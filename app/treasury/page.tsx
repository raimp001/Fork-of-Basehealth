"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Copy, ExternalLink, Loader2, ShieldAlert, Wallet } from "lucide-react"
import { toast } from "sonner"

type TreasuryBalancesResponse = {
  success: boolean
  generatedAt?: string
  error?: string
  help?: string
  network?: { name: string; chainId: number; explorer: string }
  treasuryAddress?: string
  balances?: {
    eth: { raw: string; formatted: string }
    usdc: { raw: string; formatted: string }
  }
}

function formatAddress(address?: string | null) {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function TreasuryPage() {
  const [data, setData] = useState<TreasuryBalancesResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const explorerAddressUrl = useMemo(() => {
    if (!data?.network?.explorer || !data?.treasuryAddress) return null
    return `${data.network.explorer}/address/${data.treasuryAddress}`
  }, [data?.network?.explorer, data?.treasuryAddress])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/treasury/balances", { cache: "no-store" })
        const json = (await res.json()) as TreasuryBalancesResponse
        setData(json)
      } catch (error) {
        setData({ success: false, error: "Failed to load treasury balances" })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const copy = async (value?: string) => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    toast.success("Copied", { description: "Treasury address copied to clipboard." })
  }

  return (
    <div className="min-h-screen bg-background">
      <MinimalNavigation />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pt-24 pb-24 md:pb-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-foreground text-sm font-semibold mb-4">
            <Wallet className="h-4 w-4" />
            Treasury
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">App Funds on Base</h1>
          <p className="text-muted-foreground">
            This is the app-owned settlement wallet (configured via <code className="font-mono">NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS</code>).
          </p>
        </div>

        {!loading && data && !data.success && (
          <Alert variant="destructive" className="mb-6">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Not Ready</AlertTitle>
            <AlertDescription>
              {data.error}
              {data.help ? ` ${data.help}` : null}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Treasury Address</CardTitle>
              <CardDescription>Where Base Pay + USDC settlements land</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-4 py-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="font-mono text-sm text-foreground break-all">{data?.treasuryAddress || "—"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => copy(data?.treasuryAddress)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      {explorerAddressUrl && (
                        <Button asChild variant="outline" size="icon">
                          <a href={explorerAddressUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  {data?.network && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">
                        {data.network.name} ({data.network.chainId})
                      </Badge>
                      <Badge variant="outline">Base Settlement</Badge>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Balances</CardTitle>
              <CardDescription>Read-only view from RPC</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </div>
              ) : (
                <div className="grid gap-3">
                  <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
                    <div>
                      <p className="text-xs text-muted-foreground">ETH</p>
                      <p className="text-lg font-semibold text-foreground">{data?.balances?.eth?.formatted || "0"}</p>
                    </div>
                    <Badge variant="outline">Gas</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
                    <div>
                      <p className="text-xs text-muted-foreground">USDC</p>
                      <p className="text-lg font-semibold text-foreground">{data?.balances?.usdc?.formatted || "0"}</p>
                    </div>
                    <Badge variant="secondary">Settlement</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Refunds, Receipts, Agent Payments</CardTitle>
            <CardDescription>Operational shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/bookings">Manage bookings & refunds</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/settings">Receipt lookup</Link>
            </Button>
            <Button asChild>
              <Link href="/agents/billing">AI-agent billing (HTTP 402)</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}


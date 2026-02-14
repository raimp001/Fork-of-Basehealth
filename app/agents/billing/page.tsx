"use client"

import Link from "next/link"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, Zap } from "lucide-react"
import { toast } from "sonner"

function formatAddress(address?: string | null) {
  if (!address) return "—"
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function AgentBillingPage() {
  const recipient = process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS || ""
  const useMainnet = process.env.NEXT_PUBLIC_USE_MAINNET === "true" || process.env.NODE_ENV === "production"
  const explorer = useMainnet ? "https://basescan.org" : "https://sepolia.basescan.org"

  const copy = async () => {
    if (!recipient) return
    await navigator.clipboard.writeText(recipient)
    toast.success("Copied", { description: "Payment address copied." })
  }

  return (
    <div className="min-h-screen bg-background">
      <MinimalNavigation />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pt-24 pb-24 md:pb-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-foreground text-sm font-semibold mb-4">
            <Zap className="h-4 w-4" />
            AI-Agent Billing
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">Pay for Agent Access (Base)</h1>
          <p className="text-muted-foreground">
            BaseHealth supports HTTP 402 (x402) payment-gated endpoints so AI agents can pay automatically for premium
            workflows and API access.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment Destination</CardTitle>
              <CardDescription>USDC/ETH settlement wallet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-4 py-3">
                <div>
                  <p className="text-xs text-muted-foreground">Treasury</p>
                  <p className="font-mono text-sm text-foreground break-all">{recipient || "Not configured"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={copy} disabled={!recipient}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  {recipient && (
                    <Button asChild variant="outline" size="icon">
                      <a href={`${explorer}/address/${recipient}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{useMainnet ? "Base Mainnet" : "Base Sepolia"}</Badge>
                <Badge variant="outline">USDC preferred</Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                If you are missing the treasury address, set{" "}
                <code className="font-mono">NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS</code> and redeploy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>x402 Flow</CardTitle>
              <CardDescription>How AI agents pay programmatically</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <ol className="list-decimal ml-5 space-y-2">
                <li>Request a paywalled resource endpoint. If payment is required, you will get HTTP 402.</li>
                <li>Read the accepted payment requirements from the 402 JSON payload.</li>
                <li>Send an exact USDC payment on Base to the <code className="font-mono">payTo</code> address.</li>
                <li>Retry the request with a valid <code className="font-mono">X-PAYMENT</code> header.</li>
              </ol>

              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground mb-2">Starter endpoints</p>
                <div className="space-y-1 font-mono text-xs text-foreground">
                  <div>GET /api/payments/402/requirements/all</div>
                  <div>GET /api/payments/402/resource/&lt;resource&gt;</div>
                  <div>POST /api/x402/verify</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Button asChild variant="outline">
                  <Link href="/payment/base">Manual payments UI</Link>
                </Button>
                <Button asChild>
                  <Link href="/treasury">Treasury dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Need a Dedicated Agent Plan?</CardTitle>
            <CardDescription>We can set per-agent pricing, receipts, and refund policies.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <Button asChild>
              <Link href="/chat?agent=billing-guide&q=Help%20me%20set%20up%20agent%20billing%20tiers%2C%20receipts%2C%20and%20refund%20policies.">Ask the Billing Agent</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/settings">Verify integration status</Link>
            </Button>
          </CardContent>
        </Card>

        <p className="mt-6 text-xs text-muted-foreground">
          Note: For production-grade agent billing, pair x402 with server-side onchain verification and a database-backed
          ledger of receipts/refunds.
        </p>
      </main>
    </div>
  )
}

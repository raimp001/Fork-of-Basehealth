"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AlertCircle, CheckCircle, ExternalLink, Loader2, RefreshCw } from "lucide-react"
import { parseEther } from "viem"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { PAYMENT_CONFIG } from "@/lib/network-config"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.basehealth.xyz"

type PriceResponse =
  | { success: true; price: number; updatedAt: string; source: string }
  | { success: false; error: string }

type VerifyResponse =
  | {
      success: true
      txHash: string
      explorerUrl: string
      paidAsset: "ETH"
      ethAmount: string
      priceUsdPerEth: number
      usdcEquivalent: string
      receipt: { receiptId: string }
    }
  | { success: false; pending?: boolean; error: string; txHash?: string }

type Step = "ready" | "sending" | "verifying" | "success" | "error"

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function EthTipCheckout({
  usdAmount,
  orderId,
  onSuccess,
}: {
  usdAmount: number
  orderId: string
  onSuccess?: () => void
}) {
  const [step, setStep] = useState<Step>("ready")
  const [error, setError] = useState<string | null>(null)
  const [price, setPrice] = useState<number | null>(null)
  const [priceUpdatedAt, setPriceUpdatedAt] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null)
  const [usdcEquivalent, setUsdcEquivalent] = useState<string | null>(null)
  const [receiptId, setReceiptId] = useState<string | null>(null)

  const recipient = PAYMENT_CONFIG.recipientAddress

  const ethEstimate = useMemo(() => {
    if (!price || !Number.isFinite(price) || price <= 0) return null
    if (!Number.isFinite(usdAmount) || usdAmount <= 0) return null
    return usdAmount / price
  }, [price, usdAmount])

  const fetchPrice = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch("/api/prices/eth-usd", { cache: "no-store" })
      const data = (await res.json().catch(() => null)) as PriceResponse | null
      if (!res.ok || !data || data.success !== true || !Number.isFinite((data as any).price)) {
        throw new Error((data as any)?.error || "Failed to load ETH price")
      }
      setPrice((data as any).price)
      setPriceUpdatedAt((data as any).updatedAt || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ETH price")
    }
  }, [])

  useEffect(() => {
    fetchPrice().catch(() => null)
  }, [fetchPrice])

  const verifyTip = useCallback(
    async (hash: string) => {
      for (let attempt = 0; attempt < 12; attempt++) {
        const res = await fetch("/api/tips/eth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ txHash: hash, orderId }),
        })

        const data = (await res.json().catch(() => null)) as VerifyResponse | null

        if (res.status === 202 && data?.success === false && data?.pending) {
          await wait(4000)
          continue
        }

        if (!res.ok || !data || data.success !== true) {
          throw new Error((data as any)?.error || "Tip verification failed")
        }

        setExplorerUrl((data as any).explorerUrl || null)
        setUsdcEquivalent((data as any).usdcEquivalent || null)
        setReceiptId((data as any)?.receipt?.receiptId || null)
        return
      }

      throw new Error("Tip verification timed out. Please retry in a moment.")
    },
    [orderId],
  )

  const handleSendEth = useCallback(async () => {
    setError(null)
    setTxHash(null)
    setExplorerUrl(null)
    setUsdcEquivalent(null)
    setReceiptId(null)
    setStep("sending")

    try {
      if (!ethEstimate || !Number.isFinite(ethEstimate) || ethEstimate <= 0) {
        throw new Error("ETH price unavailable. Refresh and retry.")
      }

      // Round to avoid sending a ridiculously long decimal string.
      const ethToSend = Number(ethEstimate.toFixed(8)).toString()
      const valueWei = parseEther(ethToSend)
      const valueHex = `0x${valueWei.toString(16)}`

      let provider: any = null
      try {
        const { createBaseAccountSDK } = await import("@base-org/account")
        const sdk = createBaseAccountSDK({
          appName: "BaseHealth",
          appLogoUrl: `${APP_URL}/icon-192.png`,
          appChainIds: [8453, 84532],
        })
        provider = sdk.getProvider()
      } catch {
        provider = null
      }

      if (!provider) {
        provider = (window as any).ethereum || null
      }

      if (!provider) {
        throw new Error("No wallet detected. Install Coinbase Wallet or use the Base app.")
      }

      const accounts = await provider.request({ method: "eth_requestAccounts" })
      const from = accounts?.[0]
      if (!from) throw new Error("No wallet account available")

      const useMainnet = process.env.NEXT_PUBLIC_USE_MAINNET === "true" || process.env.NODE_ENV === "production"
      const targetChainId = useMainnet ? "0x2105" : "0x14a34"
      const chainName = useMainnet ? "Base" : "Base Sepolia"
      const rpcUrl = useMainnet ? "https://mainnet.base.org" : "https://sepolia.base.org"
      const explorer = useMainnet ? "https://basescan.org" : "https://sepolia.basescan.org"

      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: targetChainId }],
        })
      } catch (switchError: any) {
        if (switchError?.code === 4902) {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: targetChainId,
                chainName,
                rpcUrls: [rpcUrl],
                blockExplorerUrls: [explorer],
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              },
            ],
          })
        }
      }

      const hash = await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from,
            to: recipient,
            value: valueHex,
          },
        ],
      })

      if (typeof hash !== "string" || !hash.startsWith("0x")) {
        throw new Error("No transaction hash returned")
      }

      setTxHash(hash)
      setStep("verifying")

      await verifyTip(hash)

      setStep("success")
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send tip")
      setStep("error")
    }
  }, [ethEstimate, onSuccess, recipient, verifyTip])

  if (step === "success" && txHash) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 pb-6 text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <p className="font-semibold text-stone-900">Tip sent</p>
            <p className="text-sm text-stone-600">
              Recorded as {usdcEquivalent ? `$${usdcEquivalent} USDC equivalent` : "USDC equivalent"}.
            </p>
          </div>
          {receiptId && <p className="text-xs text-stone-600">Receipt: <span className="font-mono">{receiptId}</span></p>}
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <a
              href={explorerUrl || `https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-700 hover:underline underline-offset-4"
            >
              View on BaseScan <ExternalLink className="h-4 w-4" />
            </a>
            <span className="text-stone-400">•</span>
            <Link href="/feedback" className="text-stone-700 hover:underline underline-offset-4">
              Send feedback
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-stone-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">Tip with ETH</CardTitle>
            <CardDescription>Send native ETH on Base. We record a USDC equivalent for receipts.</CardDescription>
          </div>
          <Badge variant="outline">Base</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">USD amount</span>
            <span className="text-sm font-semibold text-foreground">${usdAmount.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Estimated ETH</span>
            <span className="text-xs font-mono text-foreground">
              {ethEstimate ? `~${ethEstimate.toFixed(8)} ETH` : "—"}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Treasury</span>
            <span className="text-xs font-mono text-foreground">{recipient.slice(0, 6)}…{recipient.slice(-4)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Price</span>
            <span className="text-xs text-muted-foreground">
              {price ? `$${price.toFixed(2)} / ETH` : "Loading…"}
              {priceUpdatedAt ? ` (as of ${new Date(priceUpdatedAt).toLocaleTimeString()})` : ""}
            </span>
          </div>
          <div className="mt-3">
            <Button type="button" variant="outline" size="sm" onClick={fetchPrice} className="h-8">
              <RefreshCw className="h-3.5 w-3.5 mr-2" />
              Refresh price
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="button"
          className="w-full h-11"
          onClick={handleSendEth}
          disabled={step === "sending" || step === "verifying"}
        >
          {step === "sending" || step === "verifying" ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {step === "sending" ? "Confirm in wallet…" : "Verifying…"}
            </>
          ) : (
            "Send ETH tip"
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          Tip: ETH tips can be swapped to USDC in your wallet later if you want stable accounting.
        </p>
      </CardContent>
    </Card>
  )
}

export default EthTipCheckout

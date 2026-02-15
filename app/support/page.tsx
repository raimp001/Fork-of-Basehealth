"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { HeartHandshake, Shield, Zap } from "lucide-react"
import { BasePayCheckout } from "@/components/checkout/base-pay-checkout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { basePayConfig } from "@/lib/base-pay-service"

const PRESET_TIPS = [1, 5, 10, 25]

export default function SupportPage() {
  const [amount, setAmount] = useState<number>(5)
  const [customAmount, setCustomAmount] = useState<string>("")
  const [orderId, setOrderId] = useState(() => `tip-${Date.now()}`)

  const resolvedAmount = useMemo(() => {
    const parsed = Number.parseFloat(customAmount)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
    return amount
  }, [amount, customAmount])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-stone-50 to-white">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900 text-white text-sm font-semibold">
            <HeartHandshake className="h-4 w-4" />
            Support BaseHealth
          </div>
          <h1 className="mt-5 text-3xl sm:text-4xl font-semibold text-stone-900">Tip or support growth</h1>
          <p className="mt-3 text-stone-600 max-w-2xl mx-auto leading-7">
            Tips help fund agent improvements, faster billing automation, and better patient UX. Payments use Base Pay
            (USDC on Base) with Coinbase Smart Wallet.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              ~2s settlement
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              No chargebacks
            </Badge>
          </div>
          <p className="mt-4 text-sm text-stone-600">
            Want to suggest improvements instead?{" "}
            <Link href="/feedback" className="text-blue-700 hover:underline">
              Leave feedback
            </Link>
            .
          </p>
        </div>

        <Card className="border-stone-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Choose an amount</CardTitle>
            <CardDescription>Tips are optional. Do not include personal health information in the description.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {PRESET_TIPS.map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={amount === value && !customAmount ? "default" : "outline"}
                  onClick={() => {
                    setCustomAmount("")
                    setAmount(value)
                  }}
                >
                  ${value}
                </Button>
              ))}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-stone-900">Custom amount (USD)</label>
              <Input
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="e.g. 3.00"
                inputMode="decimal"
              />
              <p className="text-xs text-stone-600">
                Destination treasury wallet: <span className="font-mono">{basePayConfig.recipientAddress}</span>
              </p>
            </div>

            <div className="pt-2">
              <BasePayCheckout
                amount={resolvedAmount}
                serviceName="Support tip"
                serviceDescription="Tip to support BaseHealth development"
                providerName="BaseHealth"
                providerWallet={basePayConfig.recipientAddress}
                orderId={orderId}
                providerId="basehealth"
                collectEmail={false}
                onSuccess={() => {
                  // Allow a second tip without refresh.
                  setOrderId(`tip-${Date.now()}`)
                }}
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}


"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Activity,
  Bot,
  CreditCard,
  Receipt,
  Search,
  Shield,
  Wallet,
} from "lucide-react"

import { useMiniApp } from "@/components/providers/miniapp-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const STORAGE_KEY = "basehealth_miniapp_onboarding_v1"

type Slide = {
  title: string
  description: string
  chips: string[]
  cards: Array<{ title: string; body: string; icon: React.ComponentType<{ className?: string }> }>
}

function safeReadSeen(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

function safeWriteSeen() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1")
  } catch {
    // ignore
  }
}

export function MiniAppOnboarding() {
  const pathname = usePathname()
  const { isMiniApp, isReady } = useMiniApp()

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  const shouldConsiderShowing = useMemo(() => {
    if (!isReady) return false
    if (!isMiniApp) return false

    // Avoid interrupting operational/admin flows.
    const blocked =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/agents") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/onboarding")

    return !blocked
  }, [isMiniApp, isReady, pathname])

  const slides: Slide[] = useMemo(
    () => [
      {
        title: "Welcome to BaseHealth",
        description: "A minimal, one-stop mini app for healthcare. Get screening guidance, find care, and keep receipts organized.",
        chips: ["One stop", "Healthcare", "On Base"],
        cards: [
          { title: "Assistant", body: "Ask a question. We route you to the right specialist.", icon: Bot },
          { title: "Screenings", body: "Get a simple plan based on your age and risk.", icon: Activity },
          { title: "Find care", body: "Search providers by specialty and location.", icon: Search },
        ],
      },
      {
        title: "Built to get things done",
        description: "Behind the scenes, the assistant can safely use server-side tools to speed up common workflows.",
        chips: ["Tool-assisted", "Fewer clicks", "Less back-and-forth"],
        cards: [
          { title: "Provider search", body: "Fast shortlist when you share specialty + location.", icon: Search },
          { title: "Order status", body: "Check payment/booking status by order ID or tx hash.", icon: Receipt },
          { title: "One-tap checkout", body: "Prepare a Base Pay checkout when you confirm amount + purpose.", icon: CreditCard },
        ],
      },
      {
        title: "Stay in the Base app",
        description: "Explore first. Connect your Base wallet when you need personalization, receipts, or payments. No email or phone verification.",
        chips: ["No redirects", "Wallet-first", "Privacy-first"],
        cards: [
          { title: "Wallet sign-in", body: "Connect and sign a message to confirm identity.", icon: Wallet },
          { title: "Private by default", body: "We avoid sensitive identifiers and never ask for seed phrases.", icon: Shield },
          { title: "Safety note", body: "Informational support only. For emergencies, seek in-person care.", icon: Shield },
        ],
      },
    ],
    [],
  )

  useEffect(() => {
    if (!shouldConsiderShowing) return
    if (safeReadSeen()) return
    setOpen(true)
  }, [shouldConsiderShowing])

  const close = useCallback(() => {
    safeWriteSeen()
    setOpen(false)
  }, [])

  const onOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next)
      if (!next) close()
    },
    [close],
  )

  const current = slides[Math.min(Math.max(step, 0), slides.length - 1)]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(640px,calc(100vw-1.5rem))] rounded-2xl border-border/60 bg-background/80 backdrop-blur-xl p-0 shadow-glow-subtle overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.18),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(16,185,129,0.12),_transparent_60%)]" />
          <div className="relative px-6 pt-6 pb-4">
            <div className="flex items-start gap-4">
              <div className="relative h-11 w-11 overflow-hidden rounded-2xl ring-1 ring-border/60 bg-gradient-to-br from-primary/25 via-accent/10 to-transparent">
                <Image
                  src="/icon-192.png"
                  alt="BaseHealth"
                  fill
                  sizes="44px"
                  className="object-contain p-2"
                  unoptimized
                  priority
                />
              </div>
              <div className="min-w-0">
                <DialogHeader className="space-y-1 text-left">
                  <DialogTitle className="text-xl sm:text-2xl tracking-tight">{current.title}</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground leading-6">
                    {current.description}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-3 flex flex-wrap gap-2">
                  {current.chips.map((chip) => (
                    <Badge key={chip} variant="outline" className="border-border/60 bg-background/30">
                      {chip}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {current.cards.map((card) => {
                const Icon = card.icon
                return (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-border/60 bg-card/35 backdrop-blur-md p-4 shadow-glow-subtle"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-background/40 ring-1 ring-border/60">
                        <Icon className="h-4 w-4 text-foreground/80" />
                      </span>
                      <p className="text-sm font-semibold">{card.title}</p>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{card.body}</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {slides.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 w-6 rounded-full transition-colors ${
                      idx === step ? "bg-primary/80" : "bg-muted/60"
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {step + 1} / {slides.length}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 pt-2 sm:flex-row sm:justify-between sm:space-x-0">
          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Button
              variant="ghost"
              className="h-10 rounded-xl"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              Back
            </Button>
            <Button variant="outline" className="h-10 rounded-xl border-border/60 bg-background/40" onClick={close}>
              Skip
            </Button>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            {step < slides.length - 1 ? (
              <Button className="h-10 rounded-xl" onClick={() => setStep((s) => Math.min(slides.length - 1, s + 1))}>
                Next
              </Button>
            ) : (
              <Button className="h-10 rounded-xl" onClick={close} asChild>
                <Link href="/chat">Start with Assistant</Link>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MiniAppOnboarding


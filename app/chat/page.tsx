"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useChat } from "ai/react"
import { AlertCircle, Bot, Loader2, Send } from "lucide-react"
import { SignInWithBase } from "@/components/auth/sign-in-with-base"
import { BasePayCheckout } from "@/components/checkout/base-pay-checkout"
import { useMiniApp } from "@/components/providers/miniapp-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  OPENCLAW_AGENT_CATALOG,
  OPENCLAW_AGENT_IDS,
  normalizeOpenClawAgent,
  type OpenClawAgentId,
} from "@/lib/openclaw-agent-catalog"
import { basePayConfig } from "@/lib/base-pay-service"

function getMessageContent(message: any): string {
  if (typeof message?.content === "string") {
    return message.content
  }

  if (Array.isArray(message?.parts)) {
    return message.parts
      .map((part: any) => {
        if (part?.type === "text" && typeof part?.text === "string") return part.text
        return ""
      })
      .filter(Boolean)
      .join("\n")
  }

  return ""
}

const DEFAULT_EXAMPLES = [
  "What screenings should I consider this year?",
  "Help me find a provider for my issue.",
  "Should this be telehealth or in-person?",
  "What should I track before I see a doctor about this?",
]

const ASSISTANT_PASS_SERVICE_TYPE = "assistant-pass-chat"
const ASSISTANT_PASS_USD = 0.25

export default function ChatPage() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { user: miniAppUser, getEthereumProvider } = useMiniApp()

  const [assistantReady, setAssistantReady] = useState<boolean | null>(null)
  const [assistantReadyError, setAssistantReadyError] = useState<string | null>(null)
  const [assistantMeta, setAssistantMeta] = useState<{
    generatedAt?: string
    aiProvider?: string
    vercelEnv?: string | null
    commit?: string | null
    chatPaywallEnabled?: boolean
  } | null>(null)
  const [pinnedAgent, setPinnedAgent] = useState<OpenClawAgentId | null>(null)
  const [hasSentMessage, setHasSentMessage] = useState(false)
  const [actingWallet, setActingWallet] = useState("")
  const [opsMode, setOpsMode] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [passOrderId, setPassOrderId] = useState(() => `assistant-pass-chat-${Date.now()}`)
  const [passState, setPassState] = useState<{
    loading: boolean
    hasAccess: boolean
    validUntil: string | null
    error: string | null
  }>({ loading: false, hasAccess: false, validUntil: null, error: null })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const appliedQueryState = useRef(false)

  const sessionWallet = (session?.user as any)?.walletAddress as string | undefined

  const accessWallet = useMemo(() => {
    const candidate = (sessionWallet || connectedWallet || "").trim()
    return /^0x[a-fA-F0-9]{40}$/.test(candidate) ? candidate : null
  }, [connectedWallet, sessionWallet])

  useEffect(() => {
    const isWalletAddress = (value: unknown) => typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value.trim())

    try {
      const saved = window.localStorage.getItem("basehealth_wallet_address")
      if (saved && isWalletAddress(saved)) {
        setConnectedWallet((prev) => prev || saved)
      }
    } catch {
      // ignore
    }

    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ address?: unknown }>
      const next = custom?.detail?.address
      if (next === null) {
        setConnectedWallet(null)
        return
      }
      if (isWalletAddress(next)) {
        setConnectedWallet(next.trim())
        setAuthError(null)
      }
    }

    window.addEventListener("basehealth:wallet", handler as EventListener)
    return () => window.removeEventListener("basehealth:wallet", handler as EventListener)
  }, [])

  const userAvatarUrl = miniAppUser?.pfpUrl || null
  const userDisplayName =
    (miniAppUser?.displayName && miniAppUser.displayName.trim()) ||
    (miniAppUser?.username ? `@${miniAppUser.username}` : null) ||
    null
  const userFallback = (miniAppUser?.displayName || miniAppUser?.username || "U")
    .trim()
    .slice(0, 1)
    .toUpperCase()

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      // If we already have a wallet (session or previous probe), no need to probe providers.
      if (accessWallet) return
      try {
        const provider = await getEthereumProvider()
        if (!provider) return
        const accounts = await provider.request({ method: "eth_accounts" })
        const address = accounts?.[0]
        if (!cancelled && typeof address === "string" && /^0x[a-fA-F0-9]{40}$/.test(address)) {
          setConnectedWallet(address)
        }
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
    }
  }, [accessWallet, getEthereumProvider])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        setAssistantReady(null)
        setAssistantReadyError(null)
        const res = await fetch("/api/base/integration-status", { cache: "no-store" })
        const json = await res.json().catch(() => null)
        const assistantSection = Array.isArray(json?.sections)
          ? json.sections.find((section: any) => section?.id === "assistant")
          : null
        const ready = Boolean(assistantSection?.ready)
        if (!cancelled) {
          setAssistantReady(ready)
          setAssistantMeta({
            generatedAt: typeof json?.generatedAt === "string" ? json.generatedAt : undefined,
            aiProvider: typeof json?.aiProvider === "string" ? json.aiProvider : undefined,
            vercelEnv: json?.environment?.vercelEnv ?? null,
            commit: json?.environment?.gitCommitSha ?? null,
            chatPaywallEnabled:
              typeof json?.features?.chatPaywallEnabled === "boolean" ? json.features.chatPaywallEnabled : undefined,
          })
        }
      } catch (err) {
        if (cancelled) return
        setAssistantReady(false)
        setAssistantReadyError(err instanceof Error ? err.message : "Failed to check assistant status")
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const chatPaywallEnabled = assistantMeta?.chatPaywallEnabled ?? false

  const refreshPassStatus = useCallback(async () => {
    if (!chatPaywallEnabled) {
      setPassState({ loading: false, hasAccess: true, validUntil: null, error: null })
      return
    }

    if (!accessWallet) {
      setPassState({ loading: false, hasAccess: false, validUntil: null, error: null })
      return
    }

    setPassState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const res = await fetch(`/api/access/chat/status?walletAddress=${encodeURIComponent(accessWallet)}`, {
        cache: "no-store",
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || "Failed to check access")
      }
      setPassState({
        loading: false,
        hasAccess: Boolean(json?.hasAccess),
        validUntil: typeof json?.validUntil === "string" ? json.validUntil : null,
        error: null,
      })
    } catch (err) {
      setPassState({
        loading: false,
        hasAccess: false,
        validUntil: null,
        error: err instanceof Error ? err.message : "Failed to check access",
      })
    }
  }, [accessWallet, chatPaywallEnabled])

  useEffect(() => {
    refreshPassStatus().catch(() => null)
  }, [refreshPassStatus])

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("basehealth_acting_wallet") || ""
      if (saved) {
        setActingWallet(saved)
        return
      }
      if (accessWallet) {
        setActingWallet(accessWallet)
      }
    } catch {
      if (accessWallet) setActingWallet(accessWallet)
    }
  }, [accessWallet])

  useEffect(() => {
    try {
      const value = actingWallet.trim()
      if (!value) {
        window.localStorage.removeItem("basehealth_acting_wallet")
      } else {
        window.localStorage.setItem("basehealth_acting_wallet", value)
      }
    } catch {
      // ignore
    }
  }, [actingWallet])

  useEffect(() => {
    const opsParam = searchParams.get("ops")
    const agentParam = searchParams.get("agent")

    try {
      if (opsParam === "1" || agentParam) {
        window.localStorage.setItem("basehealth_ops", "1")
        setOpsMode(true)
        return
      }

      if (opsParam === "0") {
        window.localStorage.removeItem("basehealth_ops")
        setOpsMode(false)
        return
      }

      setOpsMode(window.localStorage.getItem("basehealth_ops") === "1")
    } catch {
      setOpsMode(opsParam === "1" || !!agentParam)
    }
  }, [searchParams])

  const effectivePinnedAgent = opsMode ? pinnedAgent : null

  const requestBody = useMemo(() => {
    const body: Record<string, unknown> = {
      walletAddress: (actingWallet || accessWallet || "").trim() || undefined,
      accessWalletAddress: (accessWallet || "").trim() || undefined,
    }
    if (effectivePinnedAgent) body.agent = effectivePinnedAgent
    return body
  }, [actingWallet, effectivePinnedAgent, accessWallet])

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setInput,
  } = useChat({
    api: "/api/chat",
    body: requestBody,
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hi. Ask your question and we will automatically route it to the right specialist behind the scenes. If you have urgent or severe symptoms, seek in-person emergency care immediately.",
      },
    ],
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  useEffect(() => {
    if (appliedQueryState.current) return

    const requestedAgent = normalizeOpenClawAgent(searchParams.get("agent"))
    const starterQuestion = searchParams.get("q")
    const allowOps =
      searchParams.get("ops") === "1" ||
      !!searchParams.get("agent") ||
      (() => {
        try {
          return window.localStorage.getItem("basehealth_ops") === "1"
        } catch {
          return false
        }
      })()

    if (requestedAgent && allowOps) {
      setPinnedAgent(requestedAgent)
    }

    if (starterQuestion && starterQuestion.trim()) {
      setInput(starterQuestion.trim())
    }

    appliedQueryState.current = true
  }, [searchParams, setInput])

  const placeholder =
    assistantReady === null
      ? "Checking assistant status…"
      : assistantReady === false
        ? "Assistant is temporarily offline…"
        : effectivePinnedAgent
          ? OPENCLAW_AGENT_CATALOG[effectivePinnedAgent].placeholder
          : chatPaywallEnabled
            ? !accessWallet
              ? "Connect wallet to start chatting…"
              : passState.loading
                ? "Checking access…"
                : passState.hasAccess
                  ? "Ask about screenings, care navigation, appointments, billing, refunds, or Base payments…"
                  : "Unlock Assistant Pass to start chatting…"
            : "Ask about screenings, care navigation, appointments, billing, refunds, or Base payments…"

  const examples = effectivePinnedAgent ? OPENCLAW_AGENT_CATALOG[effectivePinnedAgent].examples : DEFAULT_EXAMPLES

  const canChat = assistantReady === true && (chatPaywallEnabled ? Boolean(accessWallet) && passState.hasAccess : true)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!canChat) {
      e.preventDefault()
      return
    }
    if (input.trim()) setHasSentMessage(true)
    handleSubmit(e)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">BaseHealth Assistant</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              One chat, many specialists. We leverage OpenClaw agents to break operational bottlenecks: billing + refunds,
              prior auth checklists, lab and record summaries, and care navigation, with clear next steps so nothing gets missed.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link href="/support" className="text-muted-foreground hover:text-foreground hover:underline underline-offset-4">
              Tip or support growth
            </Link>
            <span className="text-muted-foreground/40">•</span>
            <Link href="/feedback" className="text-muted-foreground hover:text-foreground hover:underline underline-offset-4">
              Send feedback
            </Link>
            {opsMode && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <Link href="/agents" className="text-muted-foreground hover:text-foreground hover:underline underline-offset-4">
                  Operator hub
                </Link>
              </>
            )}
          </div>
        </div>

        {assistantReady !== true && (
          <Card className="mb-6 border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {assistantReady === null ? "Checking assistant status" : "Assistant offline"}
              </CardTitle>
              <CardDescription>
                {assistantReady === null
                  ? "We verify backend configuration before enabling checkout."
                  : "Chat and checkout are disabled until an AI provider is configured."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {assistantReady === null ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Admin: open{" "}
                    <Link href="/admin/integrations" className="text-foreground hover:underline underline-offset-4">
                      Integrations
                    </Link>{" "}
                    and set <code className="font-mono">OPENCLAW_API_KEY</code> (recommended) or{" "}
                    <code className="font-mono">OPENCLAW_GATEWAY_TOKEN</code> or <code className="font-mono">OPENAI_API_KEY</code>, then redeploy.
                  </p>
                  {assistantMeta?.generatedAt ? (
                    <p className="text-xs text-muted-foreground">
                      Status as of {new Date(assistantMeta.generatedAt).toLocaleString()}
                      {assistantMeta.aiProvider ? ` · AI: ${assistantMeta.aiProvider}` : ""}
                      {assistantMeta.vercelEnv ? ` · ${assistantMeta.vercelEnv}` : ""}
                      {assistantMeta.commit ? ` · ${assistantMeta.commit.slice(0, 7)}` : ""}
                    </p>
                  ) : null}
                  {assistantReadyError && (
                    <p className="text-xs text-destructive">Status check error: {assistantReadyError}</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {assistantReady === true && chatPaywallEnabled && !accessWallet && (
          <Card className="mb-6 border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sign in</CardTitle>
              <CardDescription>Connect your Base wallet to use the assistant.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <SignInWithBase
                  mode="connect"
                  onWalletConnected={(address) => {
                    setAuthError(null)
                    setConnectedWallet(address)
                  }}
                  onAuthSuccess={(address) => {
                    setAuthError(null)
                    setConnectedWallet(address)
                  }}
                  onAuthError={(message) => setAuthError(message)}
                />
                {authError ? <p className="text-xs text-destructive">{authError}</p> : null}
              </div>
            </CardContent>
          </Card>
        )}

        {assistantReady === true && !chatPaywallEnabled && !accessWallet && (
          <Card className="mb-6 border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Connect wallet (optional)</CardTitle>
              <CardDescription>
                You can chat without signing in. Connect your Base wallet to personalize your experience and enable
                checkout.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <SignInWithBase
                  mode="connect"
                  onWalletConnected={(address) => {
                    setAuthError(null)
                    setConnectedWallet(address)
                  }}
                  onAuthSuccess={(address) => {
                    setAuthError(null)
                    setConnectedWallet(address)
                  }}
                  onAuthError={(message) => setAuthError(message)}
                />
                {authError ? <p className="text-xs text-destructive">{authError}</p> : null}
              </div>
            </CardContent>
          </Card>
        )}

        {assistantReady === true && chatPaywallEnabled && accessWallet && (
          <Card className="mb-6 border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Assistant Pass</CardTitle>
                  <CardDescription>
                    Unlock chat to cover inference + compliance costs. Valid for 24 hours per purchase.
                  </CardDescription>
                </div>
                {passState.hasAccess && passState.validUntil ? (
                  <Badge variant="secondary">Active until {new Date(passState.validUntil).toLocaleString()}</Badge>
                ) : (
                  <Badge variant="outline">Required</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {passState.loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking access…
                </div>
              ) : passState.hasAccess ? (
                <p className="text-sm text-muted-foreground">
                  Pass active. Tips are optional:{" "}
                  <Link href="/support" className="text-foreground hover:underline underline-offset-4">
                    Tip or support growth
                  </Link>
                  .
                </p>
              ) : (
                <>
                  {passState.error && <p className="text-sm text-destructive">{passState.error}</p>}
                  <BasePayCheckout
                    amount={ASSISTANT_PASS_USD}
                    serviceName="Assistant Pass"
                    serviceType={ASSISTANT_PASS_SERVICE_TYPE}
                    serviceDescription="24h access to BaseHealth Assistant"
                    providerName="BaseHealth"
                    providerWallet={basePayConfig.recipientAddress}
                    orderId={passOrderId}
                    providerId="basehealth"
                    collectEmail={false}
                    onSuccess={() => {
                      setPassOrderId(`assistant-pass-chat-${Date.now()}`)
                      refreshPassStatus().catch(() => null)
                    }}
                  />
                </>
              )}
            </CardContent>
          </Card>
        )}

        {opsMode && (
          <details className="mb-6 rounded-2xl border border-border bg-background p-5 shadow-sm">
            <summary className="cursor-pointer select-none text-sm font-semibold text-foreground">
              Operator tools (optional)
            </summary>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Wallet context (optional)</p>
                <p className="text-xs text-muted-foreground">
                  Used to load wallet context (receipts, balances). Helpful for operators acting for clients. This does
                  not change your sign-in.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <Input
                    value={actingWallet}
                    onChange={(e) => setActingWallet(e.target.value)}
                    placeholder="0x… (wallet address)"
                    className="sm:w-[360px]"
                  />
                  {accessWallet && (
                    <Button type="button" variant="outline" size="sm" onClick={() => setActingWallet(accessWallet)}>
                      Use my wallet
                    </Button>
                  )}
                  <Button type="button" variant="outline" size="sm" onClick={() => setActingWallet("")}>
                    Clear
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Pin a specialist (optional)</p>
                <p className="text-xs text-muted-foreground">
                  Leave this on Auto for patients. Pinning is useful when running a focused ops workflow.
                </p>
                <select
                  value={pinnedAgent || ""}
                  onChange={(e) => setPinnedAgent((normalizeOpenClawAgent(e.target.value) as OpenClawAgentId) || null)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Auto route (recommended)</option>
                  {OPENCLAW_AGENT_IDS.map((agentId) => (
                    <option key={agentId} value={agentId}>
                      {OPENCLAW_AGENT_CATALOG[agentId].label}
                    </option>
                  ))}
                </select>
                {pinnedAgent && (
                  <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/20 p-3">
                    <Badge variant="secondary">
                      Pinned
                    </Badge>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{OPENCLAW_AGENT_CATALOG[pinnedAgent].label}</p>
                      <p className="text-xs text-muted-foreground">{OPENCLAW_AGENT_CATALOG[pinnedAgent].description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </details>
        )}

        <Card className="border-border shadow-sm overflow-hidden bg-background">
          <div className="h-[560px] overflow-y-auto p-4 space-y-4 bg-muted/20">
            {messages.map((message: any) => {
              const content = getMessageContent(message)
              const isAssistant = message.role === "assistant"

              return (
                <div key={message.id} className={`flex gap-3 ${isAssistant ? "justify-start" : "justify-end"}`}>
                  {isAssistant && (
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}

                  <div
                    className={`max-w-[78%] p-3 rounded-lg ${
                      isAssistant ? "bg-background border border-border text-foreground" : "bg-foreground text-background"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{content}</p>
                  </div>

                  {!isAssistant && (
                    <Avatar className="h-8 w-8 ring-1 ring-border/60 flex-shrink-0">
                      {userAvatarUrl ? <AvatarImage src={userAvatarUrl} alt={userDisplayName || "You"} /> : null}
                      <AvatarFallback className="text-xs font-semibold">{userFallback}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              )
            })}

            {!hasSentMessage && messages.length <= 1 && (
              <div className="bg-background border border-dashed border-border rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {examples.map((question) => {
                    const disabled = !canChat
                    return (
                      <button
                        key={question}
                        onClick={() => {
                          if (!disabled) setInput(question)
                        }}
                        className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                          disabled
                            ? "bg-muted/40 text-muted-foreground cursor-not-allowed"
                            : "bg-muted hover:bg-muted/80 text-foreground"
                        }`}
                        disabled={disabled}
                      >
                        {question}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="bg-background border border-border p-3 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>Could not get a response. If you are the admin, verify your AI keys and retry.</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-background border-t border-border">
            <form onSubmit={onSubmit} className="flex gap-2">
              <Textarea
                value={input}
                onChange={handleInputChange}
                placeholder={placeholder}
                disabled={isLoading || !canChat}
                className="flex-1 min-h-[44px] max-h-[120px]"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading || !canChat}
                className="bg-foreground hover:bg-foreground/90 text-background disabled:bg-muted disabled:text-muted-foreground"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>

            {!canChat && (
              <p className="mt-2 text-xs text-muted-foreground">
                {assistantReady !== true
                  ? assistantReady === null
                    ? "Checking assistant status…"
                    : "Assistant is offline right now."
                  : chatPaywallEnabled
                    ? !accessWallet
                      ? "Sign in above to start chatting."
                      : "Unlock Assistant Pass above to start chatting."
                    : "Chat is available."}
              </p>
            )}

            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3" />
              <span>
                Informational support only. Not a diagnosis tool. Contact licensed clinicians for medical decisions.
              </span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}

"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useChat } from "ai/react"
import { AlertCircle, Bot, Loader2, Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  OPENCLAW_AGENT_CATALOG,
  OPENCLAW_AGENT_IDS,
  normalizeOpenClawAgent,
  type OpenClawAgentId,
} from "@/lib/openclaw-agent-catalog"

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
  "How do refunds and receipts work on Base?",
  "How do I connect Coinbase Smart Wallet for payments?",
]

export default function ChatPage() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  const [pinnedAgent, setPinnedAgent] = useState<OpenClawAgentId | null>(null)
  const [hasSentMessage, setHasSentMessage] = useState(false)
  const [actingWallet, setActingWallet] = useState("")
  const [opsMode, setOpsMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const appliedQueryState = useRef(false)

  const sessionWallet = (session?.user as any)?.walletAddress as string | undefined

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("basehealth_acting_wallet") || ""
      if (saved) {
        setActingWallet(saved)
        return
      }
      if (sessionWallet) {
        setActingWallet(sessionWallet)
      }
    } catch {
      if (sessionWallet) setActingWallet(sessionWallet)
    }
  }, [sessionWallet])

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
      walletAddress: (actingWallet || sessionWallet || "").trim() || undefined,
    }
    if (effectivePinnedAgent) body.agent = effectivePinnedAgent
    return body
  }, [actingWallet, effectivePinnedAgent, sessionWallet])

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

  const placeholder = effectivePinnedAgent
    ? OPENCLAW_AGENT_CATALOG[effectivePinnedAgent].placeholder
    : "Ask about screenings, care navigation, appointments, billing, refunds, or Base payments…"

  const examples = effectivePinnedAgent ? OPENCLAW_AGENT_CATALOG[effectivePinnedAgent].examples : DEFAULT_EXAMPLES

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (input.trim()) setHasSentMessage(true)
    handleSubmit(e)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Assistant</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ask in plain language. BaseHealth routes your request to the right internal specialist automatically so the
              experience stays simple.
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
                  {sessionWallet && (
                    <Button type="button" variant="outline" size="sm" onClick={() => setActingWallet(sessionWallet)}>
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
                    <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-background" />
                    </div>
                  )}
                </div>
              )
            })}

            {!hasSentMessage && messages.length <= 1 && (
              <div className="bg-background border border-dashed border-border rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {examples.map((question) => (
                    <button
                      key={question}
                      onClick={() => setInput(question)}
                      className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-colors"
                    >
                      {question}
                    </button>
                  ))}
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
                disabled={isLoading}
                className="flex-1 min-h-[44px] max-h-[120px]"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-foreground hover:bg-foreground/90 text-background disabled:bg-muted disabled:text-muted-foreground"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>

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

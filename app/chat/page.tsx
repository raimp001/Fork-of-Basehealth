"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  AlertCircle,
  AlertTriangle,
  Bot,
  CalendarCheck2,
  CreditCard,
  DollarSign,
  FileText,
  FlaskConical,
  Loader2,
  Pill,
  ReceiptText,
  Send,
  Settings,
  Shield,
  Sparkles,
  Stethoscope,
  User,
  Users,
} from "lucide-react"
import {
  OPENCLAW_AGENT_CATALOG,
  OPENCLAW_AGENT_IDS,
  normalizeOpenClawAgent,
  type OpenClawAgentId,
} from "@/lib/openclaw-agent-catalog"

const AGENT_ICONS: Record<OpenClawAgentId, typeof Bot> = {
  "general-health": Bot,
  "screening-specialist": Stethoscope,
  "care-navigator": Users,
  "appointment-coordinator": CalendarCheck2,
  "clinical-trial-matcher": FlaskConical,
  "records-specialist": FileText,
  "medication-coach": Pill,
  "account-manager": Settings,
  "billing-guide": CreditCard,
  "claims-refunds": ReceiptText,
  "provider-ops": Users,
  "admin-ops": Shield,
  "treasury-operator": DollarSign,
  "emergency-triage": AlertTriangle,
}

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

export default function ChatPage() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [selectedAgent, setSelectedAgent] = useState<OpenClawAgentId>("general-health")
  const [hasSentMessage, setHasSentMessage] = useState(false)
  const [actingWallet, setActingWallet] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const appliedQueryState = useRef(false)

  const activeAgent = useMemo(() => OPENCLAW_AGENT_CATALOG[selectedAgent], [selectedAgent])
  const ActiveIcon = AGENT_ICONS[selectedAgent]

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

  const requestBody = useMemo(
    () => ({
      agent: selectedAgent,
      walletAddress: (actingWallet || sessionWallet || "").trim() || undefined,
    }),
    [actingWallet, selectedAgent, sessionWallet],
  )

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setInput } = useChat({
    api: "/api/chat",
    body: requestBody,
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Welcome to the OpenClaw Agent Console. Pick a specialist for your task and ask your question. For urgent symptoms, seek in-person medical care immediately.",
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

    if (requestedAgent) {
      setSelectedAgent(requestedAgent)
    }

    if (starterQuestion && starterQuestion.trim()) {
      setInput(starterQuestion.trim())
    }

    appliedQueryState.current = true
  }, [searchParams, setInput])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (input.trim()) {
      setHasSentMessage(true)
    }
    handleSubmit(e)
  }

  const handleExampleClick = (question: string) => {
    setInput(question)
  }

  const handleAgentSelect = (agentId: OpenClawAgentId) => {
    setSelectedAgent(agentId)
    if (!input.trim()) {
      setInput(OPENCLAW_AGENT_CATALOG[agentId].launchPrompt)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-800 text-white text-sm font-semibold mb-5 shadow-md">
            <Sparkles className="h-4 w-4" />
            OpenClaw Agent Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">One Agent Per Function</h1>
          <p className="text-gray-600">
            Run separate specialists for care, appointments, account setup, billing, and refunds.
          </p>
          <Link href="/agents" className="text-sm text-blue-700 hover:underline inline-block mt-2">
            Open the full agent hub
          </Link>
        </div>

        <Card className="border-stone-200 bg-white p-4 mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-left">
              <p className="text-sm font-semibold text-stone-900">Client Context (Optional)</p>
              <p className="text-xs text-stone-600">
                Used to load wallet context (receipts, balances) for agents. Great for operators acting for clients.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
              <Input
                value={actingWallet}
                onChange={(e) => setActingWallet(e.target.value)}
                placeholder="0x… (wallet address)"
                className="sm:w-[320px]"
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
        </Card>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
          {OPENCLAW_AGENT_IDS.map((agentId) => {
            const agent = OPENCLAW_AGENT_CATALOG[agentId]
            const Icon = AGENT_ICONS[agentId]
            const isActive = selectedAgent === agentId

            return (
              <button
                key={agentId}
                type="button"
                onClick={() => handleAgentSelect(agentId)}
                className={`text-left rounded-xl border p-4 transition-all ${
                  isActive
                    ? "border-stone-900 bg-stone-900 text-white shadow-md"
                    : "border-stone-200 bg-white hover:border-stone-400"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isActive ? "bg-white/15" : "bg-stone-100"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-stone-700"}`} />
                  </div>
                  <Badge
                    variant="secondary"
                    className={isActive ? "bg-white/15 text-white border-transparent" : "bg-stone-100 text-stone-700"}
                  >
                    {agent.functionArea}
                  </Badge>
                </div>
                <p className={`text-sm font-semibold mb-1 ${isActive ? "text-white" : "text-stone-900"}`}>{agent.label}</p>
                <p className={`text-xs leading-5 ${isActive ? "text-stone-100" : "text-stone-600"}`}>{agent.description}</p>
              </button>
            )
          })}
        </div>

        <Card className="p-4 border-gray-100 shadow-sm mb-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-stone-100 text-stone-700">
              <ActiveIcon className="h-3.5 w-3.5 mr-1" />
              {activeAgent.shortLabel}
            </Badge>
            <div>
              <p className="text-sm font-semibold text-gray-900">{activeAgent.label}</p>
              <p className="text-xs text-gray-600">{activeAgent.description}</p>
            </div>
          </div>
        </Card>

        <Card className="border-gray-100 shadow-sm overflow-hidden">
          <div className="h-[520px] overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message: any) => {
              const content = getMessageContent(message)
              const isAssistant = message.role === "assistant"

              return (
                <div key={message.id} className={`flex gap-3 ${isAssistant ? "justify-start" : "justify-end"}`}>
                  {isAssistant && (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <ActiveIcon className="h-4 w-4 text-gray-600" />
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] p-3 rounded-lg ${
                      isAssistant ? "bg-white border border-gray-200" : "bg-gray-900 text-white"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{content}</p>
                  </div>

                  {!isAssistant && (
                    <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              )
            })}

            {!hasSentMessage && messages.length <= 1 && (
              <div className="bg-white border border-dashed border-gray-300 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {activeAgent.examples.map((question) => (
                    <button
                      key={question}
                      onClick={() => handleExampleClick(question)}
                      className="text-xs px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <ActiveIcon className="h-4 w-4 text-gray-600" />
                </div>
                <div className="bg-white border border-gray-200 p-3 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>Could not get a response. Please retry.</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={onSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder={activeAgent.placeholder}
                disabled={isLoading}
                className="flex-1 border-gray-200 focus:border-gray-400 focus:ring-gray-100"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-300"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <AlertCircle className="h-3 w-3" />
              <span>
                This assistant provides informational support only and is not a diagnosis tool. Contact licensed clinicians
                for medical decisions.
              </span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}

"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Bot, CreditCard, Loader2, Send, Sparkles, Stethoscope, User, Users } from "lucide-react"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"

type AgentId = "general-health" | "screening-specialist" | "care-navigator" | "billing-guide"

const AGENT_OPTIONS: Record<
  AgentId,
  {
    label: string
    shortLabel: string
    description: string
    placeholder: string
    examples: string[]
  }
> = {
  "general-health": {
    label: "General Health Agent",
    shortLabel: "General",
    description: "Symptoms, wellness, and when to escalate care.",
    placeholder: "Ask a general health question...",
    examples: [
      "What are early warning signs of diabetes?",
      "How can I improve my sleep quality this week?",
      "When should I go to urgent care versus ER?",
    ],
  },
  "screening-specialist": {
    label: "Screening Specialist",
    shortLabel: "Screening",
    description: "USPSTF-aligned screening guidance by age and risk.",
    placeholder: "Ask about preventive screenings...",
    examples: [
      "Which screenings should a 46-year-old get this year?",
      "How often should I get a colon cancer screening?",
      "What risk factors change mammogram frequency?",
    ],
  },
  "care-navigator": {
    label: "Care Navigator",
    shortLabel: "Care",
    description: "Find providers, plan visits, and coordinate care.",
    placeholder: "Ask about finding providers or next steps...",
    examples: [
      "What specialist should I see for recurring migraines?",
      "How should I prepare for a telemedicine visit?",
      "How do I choose between urgent care and primary care?",
    ],
  },
  "billing-guide": {
    label: "Billing Guide",
    shortLabel: "Billing",
    description: "Healthcare payments and Base blockchain transaction help.",
    placeholder: "Ask about payments, wallets, and transactions...",
    examples: [
      "How do BaseHealth payments work on Base blockchain?",
      "What does this transaction hash mean for my appointment payment?",
      "How can I verify a USDC payment was settled?",
    ],
  },
}

const AGENT_ICONS = {
  "general-health": Bot,
  "screening-specialist": Stethoscope,
  "care-navigator": Users,
  "billing-guide": CreditCard,
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
  const [selectedAgent, setSelectedAgent] = useState<AgentId>("general-health")
  const [hasSentMessage, setHasSentMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeAgent = useMemo(() => AGENT_OPTIONS[selectedAgent], [selectedAgent])
  const ActiveIcon = AGENT_ICONS[selectedAgent]

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setInput } = useChat({
    api: "/api/chat",
    body: {
      agent: selectedAgent,
    },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Welcome to BaseHealth AI. Pick an agent mode above and ask your question. For urgent symptoms, seek in-person medical care immediately.",
      },
    ],
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (input.trim()) {
      setHasSentMessage(true)
    }
    handleSubmit(e)
  }

  const handleExampleClick = (question: string) => {
    setInput(question)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50">
      <MinimalNavigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-800 text-white text-sm font-semibold mb-6 shadow-md">
            <Sparkles className="h-4 w-4" />
            OpenClaw Agents
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Health Assistant</h1>
          <p className="text-gray-600">Get specialized support for screenings, care navigation, and billing</p>
        </div>

        {/* Agent Selector */}
        <Card className="p-4 border-gray-100 shadow-sm mb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Active agent</p>
              <p className="text-xs text-gray-600">{activeAgent.description}</p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-stone-100 text-stone-700">
                <ActiveIcon className="h-3.5 w-3.5 mr-1" />
                {activeAgent.shortLabel}
              </Badge>
              <Select value={selectedAgent} onValueChange={(value) => setSelectedAgent(value as AgentId)}>
                <SelectTrigger className="w-[230px] border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AGENT_OPTIONS).map(([value, option]) => (
                    <SelectItem key={value} value={value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Chat Container */}
        <Card className="border-gray-100 shadow-sm overflow-hidden">
          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message: any) => {
              const content = getMessageContent(message)
              const isAssistant = message.role === "assistant"

              return (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  isAssistant ? "justify-start" : "justify-end"
                }`}
              >
                {isAssistant && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-gray-600" />
                  </div>
                )}
                
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    isAssistant
                      ? "bg-white border border-gray-200"
                      : "bg-gray-900 text-white"
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
                  <Bot className="h-4 w-4 text-gray-600" />
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

          {/* Input Area */}
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

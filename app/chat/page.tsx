"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Send, 
  Bot, 
  User,
  Loader2,
  AlertCircle,
  MessageSquare,
  Sparkles
} from "lucide-react"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const exampleQuestions = [
  "What are the symptoms of diabetes?",
  "How can I improve my sleep quality?",
  "What vaccines do I need at my age?",
  "When should I see a doctor for a headache?"
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your health assistant. I can help answer questions about symptoms, medications, health conditions, and general wellness. How can I help you today?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I understand you're asking about health-related topics. While I can provide general information, please remember that I'm not a substitute for professional medical advice. For specific health concerns, always consult with a qualified healthcare provider.",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExampleClick = (question: string) => {
    setInput(question)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            AI-Powered
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Health Assistant</h1>
          <p className="text-gray-600">Get instant answers to your health questions</p>
        </div>

        {/* Chat Container */}
        <Card className="border-gray-100 shadow-sm overflow-hidden">
          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'assistant' ? 'justify-start' : 'justify-end'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-gray-600" />
                  </div>
                )}
                
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.role === 'assistant'
                      ? 'bg-white border border-gray-200'
                      : 'bg-gray-900 text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'assistant' ? 'text-gray-500' : 'text-gray-300'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}

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

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            {/* Example Questions */}
            {messages.length === 1 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {exampleQuestions.map((question) => (
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

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a health question..."
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
              <span>This AI provides general health information only. Always consult healthcare professionals for medical advice.</span>
            </div>
          </div>
        </Card>

        {/* Info Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <Card className="p-4 border-gray-100 text-center">
            <MessageSquare className="h-6 w-6 text-gray-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">Instant Answers</h3>
            <p className="text-xs text-gray-600">Get quick responses to health questions</p>
          </Card>
          
          <Card className="p-4 border-gray-100 text-center">
            <Bot className="h-6 w-6 text-gray-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">AI-Powered</h3>
            <p className="text-xs text-gray-600">Advanced AI trained on medical data</p>
          </Card>
          
          <Card className="p-4 border-gray-100 text-center">
            <AlertCircle className="h-6 w-6 text-gray-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">Not Medical Advice</h3>
            <p className="text-xs text-gray-600">Consult doctors for diagnoses</p>
          </Card>
        </div>
      </main>
    </div>
  )
}
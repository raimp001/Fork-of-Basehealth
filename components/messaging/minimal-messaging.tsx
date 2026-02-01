"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Send } from "lucide-react"

export function MinimalMessaging() {
  const [activeChat, setActiveChat] = useState<string | null>(null)

  // Conversations are loaded from the user's actual message history
  const conversations: {
    id: string
    name: string
    role: string
    avatar: string
    lastMessage: string
    time: string
    unread: boolean
  }[] = []

  // Messages are loaded when a conversation is selected
  const messages: {
    id: string
    sender: string
    text: string
    time: string
  }[] = [
    {
      id: "4",
      sender: "provider",
      text: "Let me know if you have any questions about the results or if you experience any new symptoms.",
      time: "10:30 AM",
    },
  ]

  return (
    <div className="container px-4 py-6 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {activeChat ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setActiveChat(null)} className="h-8 w-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Provider" />
              <AvatarFallback>P</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-sm font-medium">Provider</h2>
              <p className="text-xs text-muted-foreground">Healthcare Provider</p>
            </div>
          </div>

          <div className="space-y-4 mb-4 h-[calc(100vh-220px)] overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p>{message.text}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">{message.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <Input placeholder="Type a message..." className="flex-1" />
            <Button size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <Card
              key={conversation.id}
              className={`cursor-pointer ${conversation.unread ? "border-primary/50" : ""}`}
              onClick={() => setActiveChat(conversation.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                    <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{conversation.name}</h3>
                      <span className="text-xs text-muted-foreground">{conversation.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{conversation.role}</p>
                    <p className={`text-sm truncate ${conversation.unread ? "font-medium" : ""}`}>
                      {conversation.lastMessage}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

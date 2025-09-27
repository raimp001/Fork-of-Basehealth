"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { StandardizedInput } from "@/components/ui/standardized-form"
import { PrimaryActionButton, StandardizedButton } from "@/components/ui/standardized-button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LoadingSpinner } from "@/components/ui/loading"
import { useErrorHandler } from "@/components/ui/error-boundary"
import { 
  Send, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  Image as ImageIcon,
  FileText,
  AlertCircle
} from "lucide-react"
import { format } from "date-fns"

interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: Date
  type: 'text' | 'image' | 'file' | 'system'
  status: 'sending' | 'sent' | 'delivered' | 'read'
  attachment?: {
    url: string
    name: string
    size: number
    type: string
  }
}

interface ChatParticipant {
  id: string
  name: string
  avatar?: string
  role: 'patient' | 'provider' | 'caregiver'
  status: 'online' | 'offline' | 'away'
  lastSeen?: Date
}

interface RealTimeChatProps {
  participants: ChatParticipant[]
  currentUserId: string
  chatId: string
  onVideoCall?: () => void
  onVoiceCall?: () => void
}

export function RealTimeChat({ 
  participants, 
  currentUserId, 
  chatId,
  onVideoCall,
  onVoiceCall 
}: RealTimeChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { error, handleError } = useErrorHandler()

  // Mock initial messages
  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: "1",
        senderId: participants[0].id,
        senderName: participants[0].name,
        senderAvatar: participants[0].avatar,
        content: "Hi! I wanted to follow up on our last appointment.",
        timestamp: new Date(Date.now() - 3600000),
        type: 'text',
        status: 'read'
      },
      {
        id: "2",
        senderId: currentUserId,
        senderName: "You",
        content: "Hello! Yes, I've been following the treatment plan as discussed.",
        timestamp: new Date(Date.now() - 3000000),
        type: 'text',
        status: 'read'
      },
      {
        id: "3",
        senderId: participants[0].id,
        senderName: participants[0].name,
        senderAvatar: participants[0].avatar,
        content: "That's great to hear! How are you feeling?",
        timestamp: new Date(Date.now() - 2400000),
        type: 'text',
        status: 'delivered'
      }
    ]
    setMessages(mockMessages)
    setIsConnected(true)
  }, [participants, currentUserId])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isConnected) return

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: "You",
      content: newMessage,
      timestamp: new Date(),
      type: 'text',
      status: 'sending'
    }

    setMessages(prev => [...prev, message])
    setNewMessage("")

    // Simulate sending message
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, status: 'sent' }
            : msg
        )
      )
    }, 500)

    // Simulate delivery
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, status: 'delivered' }
            : msg
        )
      )
    }, 1000)

    // Simulate read receipt
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, status: 'read' }
            : msg
        )
      )
    }, 2000)

    // Simulate response
    setTimeout(() => {
      const responses = [
        "Thanks for the update! Keep up the good work.",
        "I'm glad to hear that. Let me know if you have any questions.",
        "That's excellent progress. How about scheduling a follow-up?",
        "Good to know. Remember to take your medications as prescribed."
      ]
      
      const response: Message = {
        id: (Date.now() + 1).toString(),
        senderId: participants[0].id,
        senderName: participants[0].name,
        senderAvatar: participants[0].avatar,
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        type: 'text',
        status: 'delivered'
      }
      
      setMessages(prev => [...prev, response])
    }, 3000)
  }

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      // In real implementation, emit typing event via WebSocket
      setTimeout(() => setIsTyping(false), 3000)
    }
  }

  const getMessageStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400" />
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />
    }
  }

  const otherParticipant = participants.find(p => p.id !== currentUserId)

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-2xl mx-auto">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={otherParticipant?.avatar} />
            <AvatarFallback>
              {otherParticipant?.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">{otherParticipant?.name}</h3>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={
                  otherParticipant?.status === 'online' 
                    ? "border-green-500 text-green-700" 
                    : "border-gray-300 text-gray-500"
                }
              >
                {otherParticipant?.status}
              </Badge>
              <span className="text-sm text-gray-500 capitalize">
                {otherParticipant?.role}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onVoiceCall && (
            <StandardizedButton
              variant="ghost"
              size="sm"
              onClick={onVoiceCall}
              className="rounded-full"
            >
              <Phone className="h-4 w-4" />
            </StandardizedButton>
          )}
          {onVideoCall && (
            <StandardizedButton
              variant="ghost"
              size="sm"
              onClick={onVideoCall}
              className="rounded-full"
            >
              <Video className="h-4 w-4" />
            </StandardizedButton>
          )}
          <StandardizedButton
            variant="ghost"
            size="sm"
            className="rounded-full"
          >
            <MoreVertical className="h-4 w-4" />
          </StandardizedButton>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Connecting to chat...</span>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isCurrentUser = message.senderId === currentUserId
            
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isCurrentUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.senderAvatar} />
                    <AvatarFallback>
                      {message.senderName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isCurrentUser
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.type === 'text' && (
                      <p className="text-sm">{message.content}</p>
                    )}
                    
                    {message.type === 'image' && message.attachment && (
                      <div className="space-y-2">
                        <img 
                          src={message.attachment.url} 
                          alt={message.attachment.name}
                          className="rounded max-w-full"
                        />
                        <p className="text-xs opacity-80">{message.attachment.name}</p>
                      </div>
                    )}
                    
                    {message.type === 'file' && message.attachment && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{message.attachment.name}</span>
                        <span className="text-xs opacity-70">
                          ({(message.attachment.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {format(message.timestamp, 'h:mm a')}
                    </span>
                    {isCurrentUser && getMessageStatusIcon(message.status)}
                  </div>
                </div>
              </div>
            )
          })}
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
              <span>{otherParticipant?.name} is typing...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t">
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex items-center gap-2"
        >
          <StandardizedButton
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full"
          >
            <Paperclip className="h-4 w-4" />
          </StandardizedButton>
          
          <StandardizedInput
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              handleTyping()
            }}
            placeholder="Type a message..."
            className="flex-1"
            disabled={!isConnected}
          />
          
          <PrimaryActionButton
            type="submit"
            size="sm"
            disabled={!newMessage.trim() || !isConnected}
          >
            <Send className="h-4 w-4" />
          </PrimaryActionButton>
        </form>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          Messages are end-to-end encrypted
        </p>
      </div>
    </Card>
  )
}

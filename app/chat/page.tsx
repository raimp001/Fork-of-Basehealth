import { Suspense } from "react"
import { HealthAssistantChatClient } from "./client"

export const metadata = {
  title: "Health Assistant Chat | BaseHealth",
  description: "Chat with our AI health assistant for personalized health guidance and information",
}

export default function ChatPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Health Assistant</h1>
      <Suspense fallback={<ChatSkeleton />}>
        <HealthAssistantChatClient />
      </Suspense>
    </div>
  )
}

function ChatSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto rounded-lg border shadow-sm p-6 animate-pulse">
      <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
      <div className="h-4 w-2/3 bg-gray-200 rounded mb-8"></div>
      <div className="h-[400px] bg-gray-100 rounded-md mb-4"></div>
      <div className="flex gap-2">
        <div className="h-10 bg-gray-200 rounded flex-1"></div>
        <div className="h-10 w-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}

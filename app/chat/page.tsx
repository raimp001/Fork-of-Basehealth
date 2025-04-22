import { HealthAssistantChat } from "@/components/chat/health-assistant-chat"

export const metadata = {
  title: "Health Assistant Chat | BaseHealth",
  description: "Chat with our AI health assistant for personalized health guidance and information",
}

export default function ChatPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Health Assistant</h1>
      <HealthAssistantChat />
    </div>
  )
}

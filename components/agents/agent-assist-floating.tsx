"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AgentAssistFloatingProps = {
  className?: string
}

export function AgentAssistFloating({ className }: AgentAssistFloatingProps) {
  const pathname = usePathname()

  // Avoid stacking assistant UI on the assistant itself.
  if (pathname?.startsWith("/chat")) return null

  return (
    <Button
      asChild
      variant="default"
      className={cn(
        "fixed bottom-20 right-4 z-50 h-12 rounded-full shadow-lg gap-2 md:bottom-6 md:right-6 bg-foreground text-background hover:bg-foreground/90",
        className,
      )}
      aria-label="Open assistant"
    >
      <Link href="/chat">
        <Bot className="h-5 w-5" />
        <span className="hidden sm:inline">Assistant</span>
      </Link>
    </Button>
  )
}

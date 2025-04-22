"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Calendar, MessageSquare, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function MinimalBottomNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/minimal",
      label: "Home",
      icon: Home,
    },
    {
      href: "/minimal-providers",
      label: "Find",
      icon: Search,
    },
    {
      href: "/minimal-screening",
      label: "Screening",
      icon: Calendar,
    },
    {
      href: "/minimal-messages",
      label: "Messages",
      icon: MessageSquare,
    },
    {
      href: "/minimal-onboarding",
      label: "Profile",
      icon: User,
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background">
      {routes.map((route) => {
        const Icon = route.icon
        const isActive = pathname === route.href

        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex h-full w-full flex-col items-center justify-center space-y-1",
              isActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs">{route.label}</span>
          </Link>
        )
      })}
    </div>
  )
}

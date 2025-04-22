import type React from "react"
import { SimplifiedNav } from "@/components/simplified-nav"

export default function SimplifiedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SimplifiedNav />
      <main className="flex-1">{children}</main>
    </div>
  )
}

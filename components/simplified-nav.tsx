"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Stethoscope, Video, Wallet, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function SimplifiedNav() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const routes = [
    {
      href: "/simplified-screening",
      label: "Screening",
      icon: Stethoscope,
    },
    {
      href: "/simplified-telemedicine",
      label: "Telemedicine",
      icon: Video,
    },
    {
      href: "/simplified-wallet",
      label: "Wallet",
      icon: Wallet,
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/simplified" className="mr-4 flex items-center space-x-2">
          <span className="font-bold">BaseHealth</span>
        </Link>

        <div className="hidden md:flex flex-1 items-center justify-center">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {routes.map((route) => {
              const Icon = route.icon
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center transition-colors hover:text-foreground/80",
                    pathname === route.href ? "text-foreground" : "text-foreground/60",
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="hidden md:flex items-center justify-end space-x-2">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </div>

        <div className="md:hidden flex flex-1 justify-end">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4">
            <nav className="grid gap-2">
              {routes.map((route) => {
                const Icon = route.icon
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "flex items-center py-2 px-3 rounded-md transition-colors",
                      pathname === route.href ? "bg-muted font-medium" : "hover:bg-muted",
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {route.label}
                  </Link>
                )
              })}
            </nav>
            <div className="mt-4 pt-4 border-t">
              <Button className="w-full" variant="outline">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

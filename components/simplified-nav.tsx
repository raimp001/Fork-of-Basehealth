"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Stethoscope, Search, FlaskConical, Menu } from "lucide-react"
import { SignInWithBase } from "@/components/auth/sign-in-with-base"

export function SimplifiedNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const routes = [
    {
      href: "/screening",
      label: "Screening",
      icon: Stethoscope,
    },
    {
      href: "/providers/search",
      label: "Providers",
      icon: Search,
    },
    {
      href: "/clinical-trials",
      label: "Clinical Trials",
      icon: FlaskConical,
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-4 flex items-center space-x-2">
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
          <SignInWithBase />
        </div>

        <div className="md:hidden flex flex-1 justify-end">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <nav className="grid gap-2 mt-6">
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
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {route.label}
                    </Link>
                  )
                })}
                <div className="mt-4 pt-4 border-t">
                  <SignInWithBase className="w-full justify-center" />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

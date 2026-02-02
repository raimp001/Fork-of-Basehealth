"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, Search, Calendar, Activity, Hospital } from "lucide-react"
import { SignInWithBase } from "@/components/auth/sign-in-with-base"

export function MainNavigation() {
  const [isOpen, setIsOpen] = useState(false)

  const mainLinks = [
    { name: "Screening", href: "/screening" },
    { name: "Find Providers", href: "/providers/search" },
    { name: "Clinical Trials", href: "/clinical-trials" },
  ]

  const mobileLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Health Screening", href: "/screening", icon: Activity },
    { name: "Find Providers", href: "/providers/search", icon: Search },
    { name: "Clinical Trials", href: "/clinical-trials", icon: Hospital },
    { name: "Appointments", href: "/appointment/request", icon: Calendar },
  ]

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/" className="text-2xl font-bold text-slate-900 hover:text-slate-700 transition-colors">
              <span className="sr-only">BaseHealth</span>
              BaseHealth
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-slate-700 hover:text-slate-900">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="px-2 py-6">
                  <Link href="/" className="flex items-center mb-6 text-2xl font-bold text-slate-900" onClick={() => setIsOpen(false)}>
                    BaseHealth
                  </Link>
                  <nav className="flex flex-col space-y-4">
                    {mobileLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="flex items-center px-3 py-2 text-base font-medium rounded-md hover:bg-slate-50 text-slate-700 hover:text-slate-900"
                        onClick={() => setIsOpen(false)}
                      >
                        <link.icon className="mr-3 h-5 w-5 text-slate-600" />
                        {link.name}
                      </Link>
                    ))}
                    <div className="pt-4 mt-4 border-t border-slate-200">
                      <div className="px-3 py-2">
                        <SignInWithBase className="w-full justify-center" />
                      </div>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {mainLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          {/* Login button */}
          <div className="hidden md:flex md:items-center md:justify-end md:flex-1">
            <SignInWithBase />
          </div>
        </div>
      </div>
    </div>
  )
}
